import * as path from 'path';
import * as os from 'os';
import { Utility } from './Utility';
import { GitHubActionsToolHelper } from './GitHubActionsToolHelper'
import fs = require('fs');

const ORYX_CLI_IMAGE: string = 'mcr.microsoft.com/oryx/cli:builder-debian-bullseye-20230926.1';
const ORYX_BULLSEYE_BUILDER_IMAGE: string = 'mcr.microsoft.com/oryx/builder:debian-bullseye-20231107.2'
const ORYX_BOOKWORM_BUILDER_IMAGE: string = 'mcr.microsoft.com/oryx/builder:debian-bookworm-20231107.2'
const ORYX_BUILDER_IMAGES: string[] = [ ORYX_BULLSEYE_BUILDER_IMAGE, ORYX_BOOKWORM_BUILDER_IMAGE ];
const IS_WINDOWS_AGENT: boolean = os.platform() == 'win32';
const PACK_CMD: string = IS_WINDOWS_AGENT ? path.join(os.tmpdir(), 'pack') : 'pack';
const toolHelper = new GitHubActionsToolHelper();
const util = new Utility();

export class ContainerAppHelper {
    readonly disableTelemetry: boolean = false;

    constructor(disableTelemetry: boolean) {
        this.disableTelemetry = disableTelemetry;
    }

    /**
     * Creates an Azure Container App.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param environment - the Container App Environment that will be associated with the Container App
     * @param optionalCmdArgs - a set of optional command line arguments
     */
    public async createContainerApp(
        containerAppName: string,
        resourceGroup: string,
        environment: string,
        optionalCmdArgs: string[]) {
        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} --environment ${environment} --output none`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

     /**
     * Creates an Azure Container App.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param optionalCmdArgs - a set of optional command line arguments
     */
     public async createOrUpdateContainerAppWithUp(
        containerAppName: string,
        resourceGroup: string,
        optionalCmdArgs: string[],
        location: string) {
        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp up -n ${containerAppName} -g ${resourceGroup} -l ${location} --debug`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Creates an Azure Container App based from a YAML configuration file.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
     */
    public async createContainerAppFromYaml(
        containerAppName: string,
        resourceGroup: string,
        yamlConfigPath: string) {
        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
        try {
            let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath} --output none`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing Azure Container App based from an image that was previously built.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param optionalCmdArgs - a set of optional command line arguments
     */
    public async updateContainerApp(
        containerAppName: string,
        resourceGroup: string,
        optionalCmdArgs: string[]) {
        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" `);
        try {
            let command = `az containerapp update -n ${containerAppName} -g ${resourceGroup} --output none`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing Azure Container App using the 'az containerapp up' command.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param optionalCmdArgs - a set of optional command line arguments
     * @param ingress - the ingress that the Container App will be exposed on
     * @param targetPort - the target port that the Container App will be exposed on
     */
    public async updateContainerAppWithUp(
        containerAppName: string,
        resourceGroup: string,
        optionalCmdArgs: string[],
        ingress?: string,
        targetPort?: string) {
        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp up -n ${containerAppName} -g ${resourceGroup}`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });

            if (!util.isNullOrEmpty(ingress)) {
                command += ` --ingress ${ingress}`;
            }

            if (!util.isNullOrEmpty(targetPort)) {
                command += ` --target-port ${targetPort}`;
            }

            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing Azure Container App based from a YAML configuration file.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
     */
    public async updateContainerAppFromYaml(
        containerAppName: string,
        resourceGroup: string,
        yamlConfigPath: string) {
        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
        try {
            let command = `az containerapp update -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath} --output none`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Determines if the provided Container App exists in the provided resource group.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @returns true if the Container App exists, false otherwise
     */
    public async doesContainerAppExist(containerAppName: string, resourceGroup: string): Promise<boolean> {
        toolHelper.writeDebug(`Attempting to determine if Container App with name "${containerAppName}" exists in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp show -n ${containerAppName} -g ${resourceGroup} -o none`;
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return false;
        }
    }

    /**
     * Determines if the provided Container App Environment exists in the provided resource group.
     * @param containerAppEnvironment - the name of the Container App Environment
     * @param resourceGroup - the resource group that the Container App Environment is found in
     * @returns true if the Container App Environment exists, false otherwise
     */
    public async doesContainerAppEnvironmentExist(containerAppEnvironment: string, resourceGroup: string): Promise<boolean> {
        toolHelper.writeDebug(`Attempting to determine if Container App Environment with name "${containerAppEnvironment}" exists in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp env show -n ${containerAppEnvironment} -g ${resourceGroup} -o none`;
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return false;
        }
    }

    /**
     * Determines if the provided resource group exists.
     * @param resourceGroup - the name of the resource group
     * @returns true if the resource group exists, false otherwise
     */
    public async doesResourceGroupExist(resourceGroup: string): Promise<boolean> {
        toolHelper.writeDebug(`Attempting to determine if resource group "${resourceGroup}" exists`);
        try {
            let command = `az group show -n ${resourceGroup} -o none`;
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return false;
        }
    }

    /**
     * Gets the default location for the Container App provider.
     * @returns the default location if found, otherwise 'eastus2'
     */
    public async getDefaultContainerAppLocation(): Promise<string> {
        toolHelper.writeDebug(`Attempting to get the default location for the Container App service for the subscription.`);
        try {
            let command = `az provider show -n Microsoft.App --query "resourceTypes[?resourceType=='containerApps'].locations[] | [0]"`
            let executionResult = await util.execute(command);
            // If successful, strip out double quotes, spaces and parentheses from the first location returned
            return executionResult.exitCode === 0 ? executionResult.stdout.toLowerCase().replace(/["() ]/g, "").trim() : `eastus2`;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return `eastus2`;
        }
    }

    /**
     * Creates a new resource group in the provided location.
     * @param name - the name of the resource group to create
     * @param location - the location to create the resource group in
     */
    public async createResourceGroup(name: string, location: string) {
        toolHelper.writeDebug(`Attempting to create resource group "${name}" in location "${location}"`);
        try {
            let command = `az group create -n ${name} -l ${location}`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Gets the name of an existing Container App Environment in the provided resource group.
     * @param resourceGroup - the resource group to check for an existing Container App Environment
     * @returns the name of the existing Container App Environment, null if none exists
     */
    public async getExistingContainerAppEnvironment(resourceGroup: string) {
        toolHelper.writeDebug(`Attempting to get the existing Container App Environment in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp env list -g ${resourceGroup} --query "[0].name"`
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0 ? executionResult.stdout : null;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return null;
        }
    }

    /**
     * Gets the location of an existing Container App Environment
    */
    public async getExistingContainerAppEnvironmentLocation(environmentName: string, resourceGroup: string) {
        try {
            let command = `az containerapp env show -g ${resourceGroup} --query location -n ${environmentName}`;
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0 ? executionResult.stdout.toLowerCase().replace(/["() ]/g, "").trim() : null;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return null;
        }
    }

    /**
     * Gets the environment Id of an existing Container App
    */
    public async getExistingContainerAppEnvironmentName(containerAppName: string, resourceGroup: string) {
        try {
            let command = `az containerapp show -n ${containerAppName} -g ${resourceGroup} --query properties.environmentId`;
            let executionResult = await util.execute(command);
            return executionResult.exitCode === 0 ? executionResult.stdout.split("/").pop() : null;
        } catch (err) {
            toolHelper.writeInfo(err.message);
            return null;
        }
    }

    /**
     * Creates a new Azure Container App Environment in the provided resource group.
     * @param name - the name of the Container App Environment
     * @param resourceGroup - the resource group that the Container App Environment will be created in
     * @param location - the location that the Container App Environment will be created in
     */
    public async createContainerAppEnvironment(name: string, resourceGroup: string, location?: string) {
        const util = new Utility();
        toolHelper.writeDebug(`Attempting to create Container App Environment with name "${name}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp env create -n ${name} -g ${resourceGroup}`;
            if (!util.isNullOrEmpty(location)) {
                command += ` -l ${location}`;
            }
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Disables ingress on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     */
    public async disableContainerAppIngress(name: string, resourceGroup: string) {
        toolHelper.writeDebug(`Attempting to disable ingress for Container App with name "${name}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp ingress disable -n ${name} -g ${resourceGroup}`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Updates the Container Registry details on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param registryUrl - the name of the Container Registry
     * @param registryUsername - the username used to authenticate with the Container Registry
     * @param registryPassword - the password used to authenticate with the Container Registry
     */
    public async updateContainerAppRegistryDetails(name: string, resourceGroup: string, registryUrl: string, registryUsername: string, registryPassword: string) {
        toolHelper.writeDebug(`Attempting to set the Container Registry details for Container App with name "${name}" in resource group "${resourceGroup}"`);
        try {
            let command = `az containerapp registry set -n ${name} -g ${resourceGroup} --server ${registryUrl} --username ${registryUsername} --password ${registryPassword}`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Using the Oryx++ Builder, creates a runnable application image from the provided application source.
     * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
     * @param appSourcePath - the path to the application source on the machine
     * @param environmentVariables - an array of environment variables that should be provided to the builder via the `--env` flag
     * @param builderStack - the stack to use when building the provided application source
     */
    public async createRunnableAppImage(
        imageToDeploy: string,
        appSourcePath: string,
        environmentVariables: string[],
        builderStack?: string) {

        let telemetryArg = toolHelper.getTelemetryArg();
        if (this.disableTelemetry) {
            telemetryArg = `ORYX_DISABLE_TELEMETRY=true`;
        }

        let couldBuildImage = false;

        for (const builderImage of ORYX_BUILDER_IMAGES) {
            if (!util.isNullOrEmpty(builderStack) && !builderImage.includes(builderStack)) {
                continue;
            }

            toolHelper.writeDebug(`Attempting to create a runnable application image with name "${imageToDeploy}" using the Oryx++ Builder "${builderImage}"`);

            try {
                let command = `build ${imageToDeploy} --path ${appSourcePath} --builder ${builderImage} --env ${telemetryArg}`;
                environmentVariables.forEach(function (envVar: string) {
                    command += ` --env ${envVar}`;
                });

                await util.execute(`${PACK_CMD} ${command}`);
                couldBuildImage = true;
                break;
            } catch (err) {
                toolHelper.writeWarning(`Unable to run 'pack build' command to produce runnable application image: ${err.message}`);
            }
        };

        // If none of the builder images were able to build the provided application source, throw an error.
        if (!couldBuildImage) {
            const errorMessage = `No builder was able to build the provided application source. Please visit the following page for more information on supported platform versions: https://aka.ms/SourceToCloudSupportedVersions`;
            toolHelper.writeError(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Using a Dockerfile that was provided or found at the root of the application source,
     * creates a runable application image.
     * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
     * @param appSourcePath - the path to the application source on the machine
     * @param dockerfilePath - the path to the Dockerfile to build and tag with the provided image name
     */
    public async createRunnableAppImageFromDockerfile(
        imageToDeploy: string,
        appSourcePath: string,
        dockerfilePath: string) {
        toolHelper.writeDebug(`Attempting to create a runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
        try {
            let command = `docker build --file ${dockerfilePath} ${appSourcePath} --tag ${imageToDeploy}`;
            await util.execute(command);
            toolHelper.writeDebug(`Successfully created runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Determines the runtime stack to use for the runnable application image.
     * @param appSourcePath - the path to the application source on the machine
     * @returns a string representing the runtime stack that can be used for the Oryx MCR runtime images
     */
    public async determineRuntimeStackAsync(appSourcePath: string): Promise<string> {
        toolHelper.writeDebug('Attempting to determine the runtime stack needed for the provided application source');
        try {
            // Use 'oryx dockerfile' command to determine the runtime stack to use and write it to a temp file
            let command = `docker run --rm -v ${appSourcePath}:/app ${ORYX_CLI_IMAGE} /bin/bash -c "oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt"`
            await util.execute(command)

            // Read the temp file to get the runtime stack into a variable
            let oryxRuntimeTxtPath = path.join(appSourcePath, 'oryx-runtime.txt');

            let runtimeStack = fs.promises.readFile(oryxRuntimeTxtPath, 'utf8').then((data) => {
                let lines = data.split('\n');
                return lines[0];
            }).catch((err) => {
                toolHelper.writeError(err.message);
                throw err;
            });

            // Delete the temp file
            fs.unlink(oryxRuntimeTxtPath, (err) => {
                if (err) {
                    toolHelper.writeWarning(`Unable to delete the temporary file "${oryxRuntimeTxtPath}". Error: ${err.message}`);
                }
            });

            return runtimeStack;
        } catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
     * to no default builder set.
     */
    public async setDefaultBuilder() {
        toolHelper.writeInfo('Setting the Oryx++ Builder as the default builder via the pack CLI');
        try {
            let command = `config default-builder ${ORYX_BUILDER_IMAGES[0]}`
            await util.execute(`${PACK_CMD} ${command}`);
        }
        catch (err) {
            toolHelper.writeError(err.message);
            throw err;
        }
    }

    /**
     * Installs the pack CLI that will be used to build a runnable application image.
     * For more Information about the pack CLI can be found here: https://buildpacks.io/docs/tools/pack/
     */
    public async installPackCliAsync() {
        toolHelper.writeDebug('Attempting to install the pack CLI');
        try {
            let command: string = '';
            let commandLine = '';
            if (IS_WINDOWS_AGENT) {
                let packZipDownloadUri: string = 'https://github.com/buildpacks/pack/releases/download/v0.31.0/pack-v0.31.0-windows.zip';
                let packZipDownloadFilePath: string = path.join(PACK_CMD, 'pack-windows.zip');
                command = `New-Item -ItemType Directory -Path ${PACK_CMD} -Force | Out-Null; Invoke-WebRequest -Uri ${packZipDownloadUri} -OutFile ${packZipDownloadFilePath}; Expand-Archive -LiteralPath ${packZipDownloadFilePath} -DestinationPath ${PACK_CMD}; Remove-Item -Path ${packZipDownloadFilePath}`;
                commandLine = 'pwsh';
            } else {
                let tgzSuffix = os.platform() == 'darwin' ? 'macos' : 'linux';
                command = `(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.31.0/pack-v0.31.0-${tgzSuffix}.tgz" | ` +
                    'tar -C /usr/local/bin/ --no-same-owner -xzv pack)';
                commandLine = 'bash';
            }
            await util.execute(`${commandLine} -c "${command}"`);
        } catch (err) {
            toolHelper.writeError(`Unable to install the pack CLI. Error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Enables experimental features for the pack CLI, such as extension support.
     */
    public async enablePackCliExperimentalFeaturesAsync() {
        toolHelper.writeDebug('Attempting to enable experimental features for the pack CLI');
        try {
            let command = `${PACK_CMD} config experimental true`;
            await util.execute(command);
        } catch (err) {
            toolHelper.writeError(`Unable to enable experimental features for the pack CLI: ${err.message}`);
            throw err;
        }
    }
}