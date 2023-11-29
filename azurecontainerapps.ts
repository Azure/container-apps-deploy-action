import * as fs from 'fs';
import * as path from 'path';
import { ContainerAppHelper } from './src/ContainerAppHelper';
import { ContainerRegistryHelper } from './src/ContainerRegistryHelper';
import { TelemetryHelper } from './src/TelemetryHelper';
import { Utility } from './src/Utility';
import { GitHubActionsToolHelper } from './src/GithubActionsToolHelper';

export class azurecontainerapps {

    public static async runMain(): Promise<void> {
        this.initializeHelpers();

        try {
            // Validate that the arguments provided can be used for one of the supported scenarios
            this.validateSupportedScenarioArguments();

            // Set up the Azure CLI to be used for this task
            await this.setupAzureCli();

            // Set up the resources required to deploy a Container App
            await this.setupResources();

            // If a Container Registry URL was provided, try to authenticate against it
            if (!this.util.isNullOrEmpty(this.registryUrl)) {
                await this.authenticateContainerRegistryAsync();
            }

            // If an Azure Container Registry name was provided, try to authenticate against it
            if (!this.util.isNullOrEmpty(this.acrName)) {
                await this.authenticateAzureContainerRegistryAsync();
            }

            // Set up property to determine if the internal registry should be used
            this.useInternalRegistry = this.util.isNullOrEmpty(this.registryUrl);

            // Set up property to trigger cloud build with 'up' command
            this.shouldCreateOrUpdateContainerAppWithUp = !this.util.isNullOrEmpty(this.appSourcePath) && this.useInternalRegistry;

            // If the application source was provided, build a runnable application image from it
            if (!this.useInternalRegistry && !this.util.isNullOrEmpty(this.appSourcePath)) {
                await this.buildAndPushImageAsync();
            }

            // If no application source was provided, set up the scenario for deploying an existing image
            if (this.util.isNullOrEmpty(this.appSourcePath)) {
                this.setupExistingImageScenario();
            }

            // If no YAML configuration file was provided, set up the Container App properties
            if (this.util.isNullOrEmpty(this.yamlConfigPath)) {
                this.setupContainerAppProperties();
            }

            // Create/update the Container App
            await this.createOrUpdateContainerApp();

            // If telemetry is enabled, log that the task completed successfully
            this.telemetryHelper.setSuccessfulResult();
        } catch (err) {
            this.toolHelper.setFailed(err.message);
            this.telemetryHelper.setFailedResult(err.message);
        } finally {
            // If telemetry is enabled, will log metadata for this task run
            await this.telemetryHelper.sendLogs();
        }
    }

    // Build-specific properties
    private static buildId: string;
    private static buildNumber: string;

    // Supported scenario properties
    private static appSourcePath: string;
    private static acrName: string;
    private static imageToDeploy: string;
    private static yamlConfigPath: string;

    // Resource properties
    private static containerAppName: string;
    private static containerAppExists: boolean;
    private static location: string;
    private static resourceGroup: string;
    private static containerAppEnvironment: string;
    private static ingressEnabled: boolean;

    // Container Registry properties
    private static registryUsername: string;
    private static registryPassword: string;
    private static registryUrl: string;

    // Command line arguments
    private static commandLineArgs: string[];

    // Helper properties
    private static telemetryHelper: TelemetryHelper;
    private static appHelper: ContainerAppHelper;
    private static registryHelper: ContainerRegistryHelper;
    private static util: Utility;
    private static toolHelper: GitHubActionsToolHelper;

    // Miscellaneous properties
    private static imageToBuild: string;
    private static ingress: string;
    private static targetPort: string;
    private static buildEnvironmentVariables: string;
    private static shouldUseUpdateCommand: boolean;
    private static useInternalRegistry: boolean;
    private static shouldCreateOrUpdateContainerAppWithUp: boolean;

    /**
     * Initializes the helpers used by this task.
     * @param disableTelemetry - Whether or not to disable telemetry for this task.
     */
    private static initializeHelpers() {
        // Set up Utility for managing miscellaneous calls
        this.util = new Utility();

        // Set up toolHelper for managing calls to the GitHub Actions toolkit
        this.toolHelper = new GitHubActionsToolHelper();

        let disableTelemetry = this.toolHelper.getInput('disableTelemetry').toLowerCase() === 'true';

        // Get buildId
        this.buildId = this.toolHelper.getBuildId();

        // Get buildNumber
        this.buildNumber = this.toolHelper.getBuildNumber();

        // Set up TelemetryHelper for managing telemetry calls
        this.telemetryHelper = new TelemetryHelper(disableTelemetry);

        // Set up ContainerAppHelper for managing calls around the Container App
        this.appHelper = new ContainerAppHelper(disableTelemetry);

        // Set up ContainerRegistryHelper for managing calls around the Container Registry
        this.registryHelper = new ContainerRegistryHelper();
    }

    /**
     * Validates the arguments provided to the task for supported scenarios.
     * @throws Error if a valid combination of the support scenario arguments is not provided.
     */
    private static validateSupportedScenarioArguments() {

        // Get the path to the application source to build and run, if provided
        this.appSourcePath = this.toolHelper.getInput('appSourcePath', false) as string;

        // Get the name of the ACR instance to push images to, if provided
        this.acrName = this.toolHelper.getInput('acrName', false) as string;

        // Get the name of the RegistryUrl to push images to, if provided
        this.registryUrl = this.toolHelper.getInput('registryUrl', false) as string;

        // Get the previously built image to deploy, if provided
        this.imageToDeploy = this.toolHelper.getInput('imageToDeploy', false) as string;

        // Get the YAML configuration file, if provided
        this.yamlConfigPath = this.toolHelper.getInput('yamlConfigPath', false) as string;

        // Get the name of the image to build if it was provided, or generate it from build variables
        this.imageToBuild = this.toolHelper.getInput('imageToBuild', false);

        // Get the user defined build environment variables, if provided
        this.buildEnvironmentVariables = this.toolHelper.getInput('buildEnvironmentVariables', false);

        // Ensure that one of appSourcePath, imageToDeploy, or yamlConfigPath is provided
        if (this.util.isNullOrEmpty(this.appSourcePath) && this.util.isNullOrEmpty(this.imageToDeploy) && this.util.isNullOrEmpty(this.yamlConfigPath)) {
            let requiredArgumentMessage = `One of the following arguments must be provided: 'appSourcePath', 'imageToDeploy', or 'yamlConfigPath'.`;
            this.toolHelper.writeError(requiredArgumentMessage);
            throw Error(requiredArgumentMessage);
        }

        // Ensure that an ACR name and registry URL are not both provided
        if (!this.util.isNullOrEmpty(this.acrName) && !this.util.isNullOrEmpty(this.registryUrl)) {
            let conflictingArgumentsMessage = `The 'acrName' and 'registryUrl' arguments cannot both be provided.`;
            this.toolHelper.writeError(conflictingArgumentsMessage);
            throw Error(conflictingArgumentsMessage);
        }

        // Set the user defined environment variables that should be propagated to the builder
        if (!this.util.isNullOrEmpty(this.buildEnvironmentVariables)) {
            // Ensure that the build environment variables are in the format 'key1=value1 key2=value2'
            const environmentVariables = this.buildEnvironmentVariables.match(/"[^"]*"|\S+/g);
            const invalidEnvironmentVariables = environmentVariables.some(variable => {
                this.toolHelper.writeError(`variable:${variable}.`);
                if (!this.util.isNullOrEmpty(variable)) {
                    return variable.indexOf('=') === -1
                }
                else {
                    return false;
                }
            });
            if (invalidEnvironmentVariables) {
                let invalidEnvironmentVariablesMessage = `The 'buildEnvironmentVariables' argument must be in the format 'key1=value1 key2=value2'.`;
                this.toolHelper.writeError(invalidEnvironmentVariablesMessage);
                throw Error(invalidEnvironmentVariablesMessage);
            }
        }
    }

    /**
     * Sets up the Azure CLI to be used for this task by logging in to Azure with the provided service connection and
     * setting the Azure CLI to install missing extensions.
     */
    private static async setupAzureCli() {
        // Set the Azure CLI to install missing extensions
        await this.util.installAzureCliExtension();
    }

    /**
     * Sets up the resources required to deploy a Container App. This includes the following:
     * - Getting or generating the Container App name
     * - Getting or discovering the location to deploy resources to
     * - Getting or creating the resource group
     * - Getting or creating the Container App Environment
     */
    private static async setupResources() {
        // Get the Container App name if it was provided, or generate it from build variables
        this.containerAppName = this.getContainerAppName();

        // Get the location to deploy resources to, if provided, or use the default location
        this.location = await this.getLocation();

        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
        this.resourceGroup = await this.getOrCreateResourceGroup(this.containerAppName, this.location);

        // Determine if the Container Appp currently exists
        this.containerAppExists = await this.appHelper.doesContainerAppExist(this.containerAppName, this.resourceGroup);

        // If the Container App doesn't exist, get/create the Container App Environment to use for the Container App
        if (!this.containerAppExists) {
            this.containerAppEnvironment = await this.getOrCreateContainerAppEnvironment(this.containerAppName, this.resourceGroup, this.location);
        }
    }

    /**
     * Gets the name of the Container App to use for the task. If the 'containerAppName' argument is not provided,
     * then a default name will be generated in the form 'gh-action-app-<buildId>-<buildNumber>'.
     * @returns The name of the Container App to use for the task.
     */
    private static getContainerAppName(): string {
        let containerAppName: string = this.toolHelper.getInput('containerAppName', false);
        if (this.util.isNullOrEmpty(containerAppName)) {
            return this.toolHelper.getDefaultContainerAppName(containerAppName);
        }

        return containerAppName;
    }

    /**
     * Gets the location to deploy resources to. If the 'location' argument is not provided, then the default location
     * for the Container App service will be used.
     * @returns The location to deploy resources to.
     */
    private static async getLocation(): Promise<string> {
        // Set deployment location, if provided
        let location: string = this.toolHelper.getInput('location', false);
        if (!this.util.isNullOrEmpty(location)) {
            return location;
        }

        // If no location was provided, attempt to discover the location of the existing Container App Environment linked to the Container App
        // or Container App Environment provided in the resource group or use the default location.
        // Get the resource group if it was provided
        let resourceGroup: string = this.toolHelper.getInput('resourceGroup', false);

        if (!this.util.isNullOrEmpty(resourceGroup)) {
            // Check if Container App exists in the resource group provided and get the location from the Container App Environment linked to it
            let containerAppExists = await this.appHelper.doesContainerAppExist(this.containerAppName, resourceGroup);
            if (containerAppExists) {
                // Get the name of the Container App Environment linked to the Container App
                var environmentName = await this.appHelper.getExistingContainerAppEnvironmentName(this.containerAppName, resourceGroup);

                // Check if environment exists in the resource group provided and get the location
                var containerAppEnvironmentExistsInResourceGroup = !this.util.isNullOrEmpty(environmentName) ? await this.appHelper.doesContainerAppEnvironmentExist(environmentName, resourceGroup) : false;
                if (containerAppEnvironmentExistsInResourceGroup) {
                    // Get the location of the Container App Environment linked to the Container App
                    location = await this.appHelper.getExistingContainerAppEnvironmentLocation(environmentName, resourceGroup);
                    return location;
                }
            }

            // Get the Container App Environment name if it was provided
            let containerAppEnvironment: string = this.toolHelper.getInput('containerAppEnvironment', false);

            // Check if Container App Environment is provided and exits in the resource group provided and get the location
            let containerAppEnvironmentExists = !this.util.isNullOrEmpty(containerAppEnvironment) ? await this.appHelper.doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup) : false;
            if (containerAppEnvironmentExists) {
                location = await this.appHelper.getExistingContainerAppEnvironmentLocation(containerAppEnvironment, resourceGroup);
                return location;
            }
        }

        // Get the default location if the Container App or Container App Environment was not found in the resource group provided.
        location = await this.appHelper.getDefaultContainerAppLocation();
        return location;

    }

    /**
     * Gets the name of the resource group to use for the task. If the 'resourceGroup' argument is not provided,
     * then a default name will be generated in the form '<containerAppName>-rg'. If the generated resource group does
     * not exist, it will be created.
     * @param containerAppName - The name of the Container App to use for the task.
     * @param location - The location to deploy resources to.
     * @returns The name of the resource group to use for the task.
     */
    private static async getOrCreateResourceGroup(containerAppName: string, location: string): Promise<string> {
        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
        let resourceGroup: string = this.toolHelper.getInput('resourceGroup', false);
        if (this.util.isNullOrEmpty(resourceGroup)) {
            resourceGroup = `${containerAppName}-rg`;
            this.toolHelper.writeInfo(`Default resource group name: ${resourceGroup}`);

            // Ensure that the resource group that the Container App will be created in exists
            const resourceGroupExists = await this.appHelper.doesResourceGroupExist(resourceGroup);
            if (!resourceGroupExists) {
                await this.appHelper.createResourceGroup(resourceGroup, location);
            }
        }

        return resourceGroup;
    }

    /**
     * Gets the name of the Container App Environment to use for the task. If the 'containerAppEnvironment' argument
     * is not provided, then the task will attempt to discover an existing Container App Environment in the resource
     * group. If no existing Container App Environment is found, then a default name will be generated in the form
     * '<containerAppName>-env'. If the Container App Environment does not exist, it will be created.
     * @param containerAppName - The name of the Container App to use for the task.
     * @param resourceGroup - The name of the resource group to use for the task.
     * @param location - The location to deploy resources to.
     * @returns The name of the Container App Environment to use for the task.
     */
    private static async getOrCreateContainerAppEnvironment(
        containerAppName: string,
        resourceGroup: string,
        location: string): Promise<string> {
        // Get the Container App environment if it was provided
        let containerAppEnvironment: string = this.toolHelper.getInput('containerAppEnvironment', false);

        // See if we can reuse an existing Container App environment found in the resource group
        if (this.util.isNullOrEmpty(containerAppEnvironment)) {
            const existingContainerAppEnvironment: string = await this.appHelper.getExistingContainerAppEnvironment(resourceGroup);
            if (!this.util.isNullOrEmpty(existingContainerAppEnvironment)) {
                this.toolHelper.writeInfo(`Existing Container App environment found in resource group: ${existingContainerAppEnvironment}`);
                return existingContainerAppEnvironment
            }
        }

        // Generate the Container App environment name if it was not provided
        if (this.util.isNullOrEmpty(containerAppEnvironment)) {
            containerAppEnvironment = `${containerAppName}-env`;
            this.toolHelper.writeInfo(`Default Container App environment name: ${containerAppEnvironment}`);
        }

        // Determine if the Container App environment currently exists and create one if it doesn't
        const containerAppEnvironmentExists: boolean = await this.appHelper.doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup);
        if (!containerAppEnvironmentExists) {
            await this.appHelper.createContainerAppEnvironment(containerAppEnvironment, resourceGroup, location);
        }

        return containerAppEnvironment;
    }

    /**
     * Authenticates calls to the provided Azure Container Registry.
     */
    private static async authenticateAzureContainerRegistryAsync() {
        this.registryUsername = this.toolHelper.getInput('acrUsername', false);
        this.registryPassword = this.toolHelper.getInput('acrPassword', false);
        this.registryUrl = `${this.acrName}.azurecr.io`;

        // Login to ACR if credentials were provided
        if (!this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
            this.toolHelper.writeInfo(`Logging in to ACR instance "${this.acrName}" with username and password credentials`);
            await this.registryHelper.loginContainerRegistryWithUsernamePassword(this.registryUrl, this.registryUsername, this.registryPassword);
        } else {
            this.toolHelper.writeInfo(`No ACR credentials provided; attempting to log in to ACR instance "${this.acrName}" with access token`);
            await this.registryHelper.loginAcrWithAccessTokenAsync(this.acrName);
        }
    }

    /**
     * Authenticates calls to the provided Container Registry.
     */
    private static async authenticateContainerRegistryAsync() {
        this.registryUsername = this.toolHelper.getInput('registryUsername', false);
        this.registryPassword = this.toolHelper.getInput('registryPassword', false);

        // Login to Container Registry if credentials were provided
        if (!this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
            this.toolHelper.writeInfo(`Logging in to Container Registry "${this.registryUrl}" with username and password credentials`);
            await this.registryHelper.loginContainerRegistryWithUsernamePassword(this.registryUrl, this.registryUsername, this.registryPassword);
        }
    }

    /**
     * Sets up the scenario where an existing image is used for the Container App.
     */
    private static setupExistingImageScenario() {
        // If telemetry is enabled, log that the previously built image scenario was targeted for this task
        this.telemetryHelper.setImageScenario();
    }

    /**
     * Builds a runnable application image using a Dockerfile or the builder and pushes it to the Container Registry.
     */
    private static async buildAndPushImageAsync() {
        // Get the name of the image to build if it was provided, or generate it from build variables
        this.imageToBuild = this.toolHelper.getInput('imageToBuild', false);

        if (this.util.isNullOrEmpty(this.imageToBuild)) {
            const imageRepository = this.toolHelper.getDefaultImageRepository()
            // Constructs the image to build based on the provided registry URL, image repository,  build ID, and build number.
            this.imageToBuild = `${this.registryUrl}/${imageRepository}:${this.buildId}.${this.buildNumber}`;
            this.toolHelper.writeInfo(`Default image to build: ${this.imageToBuild}`);
        }

        // Get the name of the image to deploy if it was provided, or set it to the value of 'imageToBuild'
        if (this.util.isNullOrEmpty(this.imageToDeploy)) {
            this.imageToDeploy = this.imageToBuild;
            this.toolHelper.writeInfo(`Default image to deploy: ${this.imageToDeploy}`);
        }

        // Get Dockerfile to build, if provided, or check if one exists at the root of the provided application
        let dockerfilePath: string = this.toolHelper.getInput('dockerfilePath', false);
        if (this.util.isNullOrEmpty(dockerfilePath)) {
            this.toolHelper.writeInfo(`No Dockerfile path provided; checking for Dockerfile at root of application source.`);
            const rootDockerfilePath = path.join(this.appSourcePath, 'Dockerfile');
            if (fs.existsSync(rootDockerfilePath)) {
                this.toolHelper.writeInfo(`Dockerfile found at root of application source.`)
                dockerfilePath = rootDockerfilePath;
            } else {
                // No Dockerfile found or provided, build the image using the builder
                await this.buildImageFromBuilderAsync(this.appSourcePath, this.imageToBuild);
            }
        } else {
            dockerfilePath = path.join(this.appSourcePath, dockerfilePath);
        }

        if (!this.util.isNullOrEmpty(dockerfilePath)) {
            // Build the image from the provided/discovered Dockerfile
            await this.buildImageFromDockerfile(this.appSourcePath, dockerfilePath, this.imageToBuild);
        }

        // Push the image to the Container Registry
        await this.registryHelper.pushImageToContainerRegistry(this.imageToBuild);
    }

    /**
     * Builds a runnable application image using the builder.
     * @param appSourcePath - The path to the application source code.
     * @param imageToBuild - The name of the image to build.
     */
    private static async buildImageFromBuilderAsync(appSourcePath: string, imageToBuild: string) {
        // Install the pack CLI
        await this.appHelper.installPackCliAsync();
        this.toolHelper.writeInfo(`Successfully installed the pack CLI.`);

        // Enable experimental features for the pack CLI
        await this.appHelper.enablePackCliExperimentalFeaturesAsync();
        this.toolHelper.writeInfo(`Successfully enabled experimental features for the pack CLI.`);

        // Define the environment variables that should be propagated to the builder
        let environmentVariables: string[] = []

        // Parse the given runtime stack input and export the platform and version to environment variables
        const runtimeStack = this.toolHelper.getInput('runtimeStack', false);
        if (!this.util.isNullOrEmpty(runtimeStack)) {
            const runtimeStackSplit = runtimeStack.split(':');
            const platformName = runtimeStackSplit[0] == "dotnetcore" ? "dotnet" : runtimeStackSplit[0];
            const platformVersion = runtimeStackSplit[1];
            environmentVariables.push(`ORYX_PLATFORM_NAME=${platformName}`);
            environmentVariables.push(`ORYX_PLATFORM_VERSION=${platformVersion}`);
        }

        // Check if the user provided a builder stack to use
        const builderStack = this.toolHelper.getInput('builderStack', false);

        // Set the target port on the image produced by the builder
        if (!this.util.isNullOrEmpty(this.targetPort)) {
            environmentVariables.push(`ORYX_RUNTIME_PORT=${this.targetPort}`);
        }

        // Set the user defined environment variables that should be propagated to the builder
        if (!this.util.isNullOrEmpty(this.buildEnvironmentVariables)) {
            this.buildEnvironmentVariables.match(/"[^"]*"|\S+/g).forEach((envVar) => {
                environmentVariables.push(envVar);
            });
        }

        this.toolHelper.writeInfo(`Building image "${imageToBuild}" using the Oryx++ Builder`);

        // Set the Oryx++ Builder as the default builder locally
        await this.appHelper.setDefaultBuilder();

        // Create a runnable application image
        await this.appHelper.createRunnableAppImage(imageToBuild, appSourcePath, environmentVariables, builderStack);

        // If telemetry is enabled, log that the builder scenario was targeted for this task
        this.telemetryHelper.setBuilderScenario();
    }

    /**
     * Builds a runnable application image using a provided or discovered Dockerfile.
     * @param appSourcePath - The path to the application source code.
     * @param dockerfilePath - The path to the Dockerfile to build.
     * @param imageToBuild - The name of the image to build.
     */
    private static async buildImageFromDockerfile(
        appSourcePath: string,
        dockerfilePath: string,
        imageToBuild: string) {
        this.toolHelper.writeInfo(`Building image "${imageToBuild}" using the provided Dockerfile`);
        await this.appHelper.createRunnableAppImageFromDockerfile(imageToBuild, appSourcePath, dockerfilePath);

        // If telemetry is enabled, log that the Dockerfile scenario was targeted for this task
        this.telemetryHelper.setDockerfileScenario();
    }

    /**
     * Sets up the Container App properties that will be passed through to the Azure CLI when a YAML configuration
     * file is not provided.
     */
    private static setupContainerAppProperties() {
        this.commandLineArgs = [];

        // Get the ingress inputs
        this.ingress = this.toolHelper.getInput('ingress', false);
        this.targetPort = this.toolHelper.getInput('targetPort', false);

        // If both ingress and target port were not provided for an existing Container App, or if ingress is to be disabled,
        // use the 'update' command, otherwise we should use the 'up' command that performs a PATCH operation on the ingress properties.
        this.shouldUseUpdateCommand = this.containerAppExists &&
            this.util.isNullOrEmpty(this.targetPort) &&
            (this.util.isNullOrEmpty(this.ingress) || this.ingress == 'disabled');

        // Pass the Container Registry credentials when creating a Container App or updating a Container App via the 'up' command
        if (!this.util.isNullOrEmpty(this.registryUrl) && !this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword) &&
            (!this.containerAppExists || (this.containerAppExists && !this.shouldUseUpdateCommand))) {
            this.commandLineArgs.push(
                `--registry-server ${this.registryUrl}`,
                `--registry-username ${this.registryUsername}`,
                `--registry-password ${this.registryPassword}`);
        }

        // Determine default values only for the 'create' scenario to avoid overriding existing values for the 'update' scenario
        if (!this.containerAppExists) {
            this.ingressEnabled = true;

            // Set the ingress value to 'external' if it was not provided
            if (this.util.isNullOrEmpty(this.ingress)) {
                this.ingress = 'external';
                this.toolHelper.writeInfo(`Default ingress value: ${this.ingress}`);
            }

            // Set the value of ingressEnabled to 'false' if ingress was provided as 'disabled'
            if (this.ingress == 'disabled') {
                this.ingressEnabled = false;
                this.toolHelper.writeInfo(`Ingress is disabled for this Container App.`);
            }

            // Handle setup for ingress values when enabled
            if (this.ingressEnabled) {
                // Get the target port if provided, or set it to the default value
                this.targetPort = this.toolHelper.getInput('targetPort', false);

                // Set the target port to 80 if it was not provided
                if (this.util.isNullOrEmpty(this.targetPort)) {
                    this.targetPort = '80';
                    this.toolHelper.writeInfo(`Default target port: ${this.targetPort}`);
                }

                // Add the ingress value and target port to the optional arguments array
                // Note: this step should be skipped if we're updating an existing Container App (ingress is enabled via a separate command)
                this.commandLineArgs.push(`--ingress ${this.ingress}`);
                this.commandLineArgs.push(`--target-port ${this.targetPort}`);
            }
        }

        const environmentVariables: string = this.toolHelper.getInput('environmentVariables', false);

        // Add user-specified environment variables
        if (!this.util.isNullOrEmpty(environmentVariables)) {
            // The --replace-env-vars flag is only used for the 'update' command,
            // otherwise --env-vars is used for 'create' and 'up'
            if (this.shouldUseUpdateCommand) {
                this.commandLineArgs.push(`--replace-env-vars ${environmentVariables}`);
            } else {
                this.commandLineArgs.push(`--env-vars ${environmentVariables}`);
            }
        }

        // Ensure '-i' argument and '--source' argument are not both provided
        if (!this.util.isNullOrEmpty(this.imageToDeploy)) {
            this.commandLineArgs.push(`-i ${this.imageToDeploy}`);
        } else if (this.shouldCreateOrUpdateContainerAppWithUp) {
            this.commandLineArgs.push(`--source ${this.appSourcePath}`);
            this.commandLineArgs.push(`-l ${this.location}`);
        }

    }

    /**
     * Creates or updates the Container App.
     */
    private static async createOrUpdateContainerApp() {
        if (!this.containerAppExists) {
            if (!this.util.isNullOrEmpty(this.yamlConfigPath)) {
                // Create the Container App from the YAML configuration file
                await this.appHelper.createContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath);
            } else if (this.shouldCreateOrUpdateContainerAppWithUp) {
                await this.appHelper.createOrUpdateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
            } else {
                // Create the Container App from command line arguments
                await this.appHelper.createContainerApp(this.containerAppName, this.resourceGroup, this.containerAppEnvironment, this.commandLineArgs);
            }

            return;
        }

        if (!this.util.isNullOrEmpty(this.yamlConfigPath)) {
            // Update the Container App from the YAML configuration file
            await this.appHelper.updateContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath);

            return;
        }

        if (this.shouldUseUpdateCommand && !this.shouldCreateOrUpdateContainerAppWithUp) {
            // Update the Container Registry details on the existing Container App, if provided as an input
            if (!this.util.isNullOrEmpty(this.registryUrl) && !this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
                await this.appHelper.updateContainerAppRegistryDetails(this.containerAppName, this.resourceGroup, this.registryUrl, this.registryUsername, this.registryPassword);
            }

            // Update the Container App using the 'update' command
            await this.appHelper.updateContainerApp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
        } else if (this.shouldCreateOrUpdateContainerAppWithUp) {
            await this.appHelper.createOrUpdateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
        } else {
            // Update the Container App using the 'up' command
            await this.appHelper.updateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs, this.ingress, this.targetPort);
        }

        // Disable ingress on the existing Container App, if provided as an input
        if (this.ingress == 'disabled') {
            await this.appHelper.disableContainerAppIngress(this.containerAppName, this.resourceGroup);
        }
    }
}

azurecontainerapps.runMain();