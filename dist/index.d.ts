declare module "src/GitHubActionsToolHelper" {
    export class GitHubActionsToolHelper {
        getBuildId(): string;
        getBuildNumber(): string;
        writeInfo(message: string): void;
        writeError(message: string): void;
        writeWarning(message: string): void;
        writeDebug(message: string): void;
        exec(commandLine: string, args?: string[], inputOptions?: Buffer): Promise<{
            exitCode: number;
            stdout: string;
            stderr: string;
        }>;
        getInput(name: string, required?: boolean): string;
        setFailed(message: string): void;
        which(tool: string, check?: boolean): Promise<string>;
        getDefaultContainerAppName(containerAppName: string): string;
        getTelemetryArg(): string;
        getEventName(): string;
        getDefaultImageRepository(): string;
    }
}
declare module "src/Utility" {
    export class Utility {
        /**
         * @param commandLine - the command to execute
         * @param args - the arguments to pass to the command
         * @param continueOnError - whether or not to continue execution if the command fails
         */
        execute(commandLine: string, args?: string[], inputOptions?: Buffer): Promise<{
            exitCode: number;
            stdout: string;
            stderr: string;
        }>;
        /**
         * Sets the Azure CLI to install the containerapp extension.
         */
        installAzureCliExtension(): Promise<void>;
        /**
         * Checks whether or not the provided string is null, undefined or empty.
         * @param str - the string to validate
         * @returns true if the string is null, undefined or empty, false otherwise
         */
        isNullOrEmpty(str: string): boolean;
    }
}
declare module "src/ContainerAppHelper" {
    export class ContainerAppHelper {
        readonly disableTelemetry: boolean;
        constructor(disableTelemetry: boolean);
        /**
         * Creates an Azure Container App.
         * @param containerAppName - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
         * @param environment - the Container App Environment that will be associated with the Container App
         * @param optionalCmdArgs - a set of optional command line arguments
         */
        createContainerApp(containerAppName: string, resourceGroup: string, environment: string, optionalCmdArgs: string[]): Promise<void>;
        /**
        * Creates an Azure Container App.
        * @param containerAppName - the name of the Container App
        * @param resourceGroup - the resource group that the Container App is found in
        * @param optionalCmdArgs - a set of optional command line arguments
        */
        createOrUpdateContainerAppWithUp(containerAppName: string, resourceGroup: string, optionalCmdArgs: string[]): Promise<void>;
        /**
         * Get the current subscription
         * @returns the current subscription
         */
        getCurrentSubscription(): Promise<string>;
        /**
         * Creates an Azure Container App based from a YAML configuration file.
         * @param containerAppName - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
         * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
         */
        createContainerAppFromYaml(containerAppName: string, resourceGroup: string, yamlConfigPath: string): Promise<void>;
        /**
         * Updates an existing Azure Container App based from an image that was previously built.
         * @param containerAppName - the name of the existing Container App
         * @param resourceGroup - the resource group that the existing Container App is found in
         * @param optionalCmdArgs - a set of optional command line arguments
         */
        updateContainerApp(containerAppName: string, resourceGroup: string, optionalCmdArgs: string[]): Promise<void>;
        /**
         * Updates an existing Azure Container App using the 'az containerapp up' command.
         * @param containerAppName - the name of the existing Container App
         * @param resourceGroup - the resource group that the existing Container App is found in
         * @param optionalCmdArgs - a set of optional command line arguments
         * @param ingress - the ingress that the Container App will be exposed on
         * @param targetPort - the target port that the Container App will be exposed on
         */
        updateContainerAppWithUp(containerAppName: string, resourceGroup: string, optionalCmdArgs: string[], ingress?: string, targetPort?: string): Promise<void>;
        /**
         * Update container app with update and ingress update to avoid failure of acr authentication.
         * @param containerAppName - the name of the existing Container App
         * @param resourceGroup - the resource group that the existing Container App is found in
         * @param ingress - the ingress that the Container App will be exposed on
         * @param targetPort - the target port that the Container App will be exposed on
         */
        updateContainerAppIngress(containerAppName: string, resourceGroup: string, ingress?: string, targetPort?: string): Promise<void>;
        /**
         * Updates an existing Azure Container App based from a YAML configuration file.
         * @param containerAppName - the name of the existing Container App
         * @param resourceGroup - the resource group that the existing Container App is found in
         * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
         */
        updateContainerAppFromYaml(containerAppName: string, resourceGroup: string, yamlConfigPath: string): Promise<void>;
        /**
         * Determines if the provided Container App exists in the provided resource group.
         * @param containerAppName - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
         * @returns true if the Container App exists, false otherwise
         */
        doesContainerAppExist(containerAppName: string, resourceGroup: string): Promise<boolean>;
        /**
         * Determines if the provided Container App Environment exists in the provided resource group.
         * @param containerAppEnvironment - the name of the Container App Environment
         * @param resourceGroup - the resource group that the Container App Environment is found in
         * @returns true if the Container App Environment exists, false otherwise
         */
        doesContainerAppEnvironmentExist(containerAppEnvironment: string, resourceGroup: string): Promise<boolean>;
        /**
         * Determines if the provided resource group exists.
         * @param resourceGroup - the name of the resource group
         * @returns true if the resource group exists, false otherwise
         */
        doesResourceGroupExist(resourceGroup: string): Promise<boolean>;
        /**
         * Gets the default location for the Container App provider.
         * @returns the default location if found, otherwise 'eastus2'
         */
        getDefaultContainerAppLocation(): Promise<string>;
        /**
         * Creates a new resource group in the provided location.
         * @param name - the name of the resource group to create
         * @param location - the location to create the resource group in
         */
        createResourceGroup(name: string, location: string): Promise<void>;
        /**
         * Gets the name of an existing Container App Environment in the provided resource group.
         * @param resourceGroup - the resource group to check for an existing Container App Environment
         * @returns the name of the existing Container App Environment, null if none exists
         */
        getExistingContainerAppEnvironment(resourceGroup: string): Promise<string>;
        /**
         * Gets the location of an existing Container App Environment
         * @param environmentName - the name of the Container App Environment
         * @param resourceGroup - the resource group that the Container App Environment is found in
        */
        getExistingContainerAppEnvironmentLocation(environmentName: string, resourceGroup: string): Promise<string>;
        /**
         * Gets the environment name of an existing Container App
         * @param containerAppName - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
        */
        getExistingContainerAppEnvironmentName(containerAppName: string, resourceGroup: string): Promise<string>;
        /**
         * Creates a new Azure Container App Environment in the provided resource group.
         * @param name - the name of the Container App Environment
         * @param resourceGroup - the resource group that the Container App Environment will be created in
         * @param location - the location that the Container App Environment will be created in
         */
        createContainerAppEnvironment(name: string, resourceGroup: string, location?: string): Promise<void>;
        /**
         * Disables ingress on an existing Container App.
         * @param name - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
         */
        disableContainerAppIngress(name: string, resourceGroup: string): Promise<void>;
        /**
         * Updates the Container Registry details on an existing Container App.
         * @param name - the name of the Container App
         * @param resourceGroup - the resource group that the Container App is found in
         * @param registryUrl - the name of the Container Registry
         * @param registryUsername - the username used to authenticate with the Container Registry
         * @param registryPassword - the password used to authenticate with the Container Registry
         */
        updateContainerAppRegistryDetails(name: string, resourceGroup: string, registryUrl: string, registryUsername: string, registryPassword: string): Promise<void>;
        /**
         * Using the Oryx++ Builder, creates a runnable application image from the provided application source.
         * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
         * @param appSourcePath - the path to the application source on the machine
         * @param environmentVariables - an array of environment variables that should be provided to the builder via the `--env` flag
         * @param builderStack - the stack to use when building the provided application source
         */
        createRunnableAppImage(imageToDeploy: string, appSourcePath: string, environmentVariables: string[], builderStack?: string): Promise<void>;
        /**
         * Using a Dockerfile that was provided or found at the root of the application source,
         * creates a runable application image.
         * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
         * @param appSourcePath - the path to the application source on the machine
         * @param dockerfilePath - the path to the Dockerfile to build and tag with the provided image name
         * @param buildArguments - an array of build arguments that should be provided to the docker build command via the `--build-arg` flag
         */
        createRunnableAppImageFromDockerfile(imageToDeploy: string, appSourcePath: string, dockerfilePath: string, buildArguments: string[]): Promise<void>;
        /**
         * Determines the runtime stack to use for the runnable application image.
         * @param appSourcePath - the path to the application source on the machine
         * @returns a string representing the runtime stack that can be used for the Oryx MCR runtime images
         */
        determineRuntimeStackAsync(appSourcePath: string): Promise<string>;
        /**
         * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
         * to no default builder set.
         */
        setDefaultBuilder(): Promise<void>;
        /**
         * Installs the pack CLI that will be used to build a runnable application image.
         * For more Information about the pack CLI can be found here: https://buildpacks.io/docs/tools/pack/
         */
        installPackCliAsync(): Promise<void>;
        /**
         * Enables experimental features for the pack CLI, such as extension support.
         */
        enablePackCliExperimentalFeaturesAsync(): Promise<void>;
    }
}
declare module "src/ContainerRegistryHelper" {
    export class ContainerRegistryHelper {
        /**
         * Authorizes Docker to make calls to the provided Container Registry instance using username and password.
         * @param registryUrl - the name of the Container Registry instance to authenticate calls to
         * @param registryUsername - the username for authentication
         * @param registryPassword - the password for authentication
         */
        loginContainerRegistryWithUsernamePassword(registryUrl: string, registryUsername: string, registryPassword: string): Promise<void>;
        /**
         * Authorizes Docker to make calls to the provided ACR instance using an access token that is generated via
         * the 'az acr login --expose-token' command.
         * @param acrName - the name of the ACR instance to authenticate calls to.
         */
        loginAcrWithAccessTokenAsync(acrName: string): Promise<void>;
        /**
         * Pushes an image to the Container Registry instance that was previously authenticated against.
         * @param imageToPush - the name of the image to push to the Container Registry instance
         */
        pushImageToContainerRegistry(imageToPush: string): Promise<void>;
    }
}
declare module "src/TelemetryHelper" {
    export class TelemetryHelper {
        readonly disableTelemetry: boolean;
        private scenario;
        private result;
        private errorMessage;
        private taskStartMilliseconds;
        constructor(disableTelemetry: boolean);
        /**
         * Marks that the task was successful in telemetry.
         */
        setSuccessfulResult(): void;
        /**
         * Marks that the task failed in telemetry.
         */
        setFailedResult(errorMessage: string): void;
        /**
         * Marks that the task used the builder scenario.
         */
        setBuilderScenario(): void;
        /**
         * Marks that the task used the Dockerfile scenario.
         */
        setDockerfileScenario(): void;
        /**
         * Marks that the task used the previously built image scenario.
         */
        setImageScenario(): void;
        /**
         * If telemetry is enabled, uses the "oryx telemetry" command to log metadata about this task execution.
         */
        sendLogs(): Promise<void>;
    }
}
declare module "azurecontainerapps" {
    export class azurecontainerapps {
        static runMain(): Promise<void>;
        private static buildId;
        private static buildNumber;
        private static appSourcePath;
        private static acrName;
        private static imageToDeploy;
        private static yamlConfigPath;
        private static containerAppName;
        private static containerAppExists;
        private static location;
        private static resourceGroup;
        private static containerAppEnvironment;
        private static containerAppEnvironmentResourceGroup;
        private static ingressEnabled;
        private static adminCredentialsProvided;
        private static registryUsername;
        private static registryPassword;
        private static registryUrl;
        private static commandLineArgs;
        private static telemetryHelper;
        private static appHelper;
        private static registryHelper;
        private static util;
        private static toolHelper;
        private static imageToBuild;
        private static ingress;
        private static targetPort;
        private static buildArguments;
        private static noIngressUpdate;
        private static useInternalRegistry;
        /**
         * Initializes the helpers used by this task.
         * @param disableTelemetry - Whether or not to disable telemetry for this task.
         */
        private static initializeHelpers;
        /**
         * Validates the arguments provided to the task for supported scenarios.
         * @throws Error if a valid combination of the support scenario arguments is not provided.
         */
        private static validateSupportedScenarioArguments;
        /**
         * Sets up the Azure CLI to be used for this task by logging in to Azure with the provided service connection and
         * setting the Azure CLI to install missing extensions.
         */
        private static setupAzureCli;
        /**
         * Sets up the resources required to deploy a Container App. This includes the following:
         * - Getting or generating the Container App name
         * - Getting or discovering the location to deploy resources to
         * - Getting or creating the resource group
         * - Getting or creating the Container App Environment
         */
        private static setupResources;
        /**
         * Gets the name of the Container App to use for the task. If the 'containerAppName' argument is not provided,
         * then a default name will be generated in the form 'gh-action-app-<buildId>-<buildNumber>'.
         * @returns The name of the Container App to use for the task.
         */
        private static getContainerAppName;
        /**
         * Gets the location to deploy resources to. If the 'location' argument is not provided, then the default location
         * for the Container App service will be used.
         * @returns The location to deploy resources to.
         */
        private static getLocation;
        /**
         * Gets the name of the resource group to use for the task. If the 'resourceGroup' argument is not provided,
         * then a default name will be generated in the form '<containerAppName>-rg'. If the generated resource group does
         * not exist, it will be created.
         * @param containerAppName - The name of the Container App to use for the task.
         * @param location - The location to deploy resources to.
         * @returns The name of the resource group to use for the task.
         */
        private static getOrCreateResourceGroup;
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
        private static getOrCreateContainerAppEnvironment;
        /**
         * Authenticates calls to the provided Azure Container Registry.
         */
        private static authenticateAzureContainerRegistryAsync;
        /**
         * Authenticates calls to the provided Container Registry.
         */
        private static authenticateContainerRegistryAsync;
        /**
         * Sets up the scenario where an existing image is used for the Container App.
         */
        private static setupExistingImageScenario;
        /**
         * Builds a runnable application image using a Dockerfile or the builder and pushes it to the Container Registry.
         */
        private static buildAndPushImageAsync;
        /**
         * Builds a runnable application image using the builder.
         * @param appSourcePath - The path to the application source code.
         * @param imageToBuild - The name of the image to build.
         * @param buildArguments - The build arguments to pass to the pack command via environment variables.
         */
        private static buildImageFromBuilderAsync;
        /**
         * Builds a runnable application image using a provided or discovered Dockerfile.
         * @param appSourcePath - The path to the application source code.
         * @param dockerfilePath - The path to the Dockerfile to build.
         * @param imageToBuild - The name of the image to build.
         * @param buildArguments - The build arguments to pass to the docker build command.
         */
        private static buildImageFromDockerfile;
        /**
         * Sets up the Container App properties that will be passed through to the Azure CLI when a YAML configuration
         * file is not provided.
         */
        private static setupContainerAppProperties;
        /**
         * Creates or updates the Container App.
         */
        private static createOrUpdateContainerApp;
    }
}
