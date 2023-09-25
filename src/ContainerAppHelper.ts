import * as core from '@actions/core';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as os from 'os';
import { Utility } from './Utility';
import fs = require('fs');

const ORYX_CLI_IMAGE: string = 'mcr.microsoft.com/oryx/cli:builder-debian-buster-20230208.1';
const ORYX_BUILDER_IMAGE: string = 'mcr.microsoft.com/oryx/builder:20230208.1';
const IS_WINDOWS_AGENT: boolean = os.platform() == 'win32';
const PACK_CMD: string = IS_WINDOWS_AGENT ? path.join(os.tmpdir(), 'pack') : 'pack';

export class ContainerAppHelper {
    readonly disableTelemetry: boolean = false;

    constructor(disableTelemetry: boolean) {
        this.disableTelemetry = disableTelemetry;
    }

    /**
     * Creates an Azure Container App based from an image that was previously built.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param environment - the Container App Environment that will be associated with the Container App
     * @param imageToDeploy - the name of the runnable application image that the Container App will be based from
     * @param optionalCmdArgs - a set of optional command line arguments
     */
    public async createContainerApp(
        containerAppName: string,
        resourceGroup: string,
        environment: string,
        imageToDeploy: string,
        optionalCmdArgs: string[]) {
        core.debug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}" based from image "${imageToDeploy}"`);
        try {
            let command = `containerapp create -n ${containerAppName} -g ${resourceGroup} -i ${imageToDeploy} --environment ${environment}`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
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
        core.debug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
        try {
            let command = `containerapp create -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath}`;
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing Azure Container App based from an image that was previously built.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param imageToDeploy - the name of the runnable application image that the Container App will be based from
     * @param optionalCmdArgs - a set of optional command line arguments
     */
    public async updateContainerApp(
        containerAppName: string,
        resourceGroup: string,
        imageToDeploy: string,
        optionalCmdArgs: string[]) {
        core.debug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" based from image "${imageToDeploy}"`);
        try {
            let command = `containerapp update -n ${containerAppName} -g ${resourceGroup} -i ${imageToDeploy}`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });

            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing Azure Container App using the 'az containerapp up' command.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param imageToDeploy - the name of the runnable application image that the Container App will be based from
     * @param optionalCmdArgs - a set of optional command line arguments
     * @param ingress - the ingress that the Container App will be exposed on
     * @param targetPort - the target port that the Container App will be exposed on
     */
    public async updateContainerAppWithUp(
        containerAppName: string,
        resourceGroup: string,
        imageToDeploy: string,
        optionalCmdArgs: string[],
        ingress?: string,
        targetPort?: string) {
        core.debug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" based from image "${imageToDeploy}"`);
        const util = new Utility();
        try {
            let command = `containerapp up -n ${containerAppName} -g ${resourceGroup} -i ${imageToDeploy}`;
            optionalCmdArgs.forEach(function (val: string) {
                command += ` ${val}`;
            });

            if (!util.isNullOrEmpty(ingress)) {
                command += ` --ingress ${ingress}`;
            }

            if (!util.isNullOrEmpty(targetPort)) {
                command += ` --target-port ${targetPort}`;
            }

            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
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
        core.debug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
        try {
            let command = `containerapp update -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath}`;
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
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
        core.debug(`Attempting to determine if Container App with name "${containerAppName}" exists in resource group "${resourceGroup}"`);
        try {
            let command = `containerapp show -n ${containerAppName} -g ${resourceGroup} -o none`;
            const exitCode = await exec.exec(`az`, command.split(' '));
            return exitCode === 0;
        } catch (err) {
            core.warning(err.message);
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
        core.debug(`Attempting to determine if Container App Environment with name "${containerAppEnvironment}" exists in resource group "${resourceGroup}"`);
        try {
            const command = `containerapp env show -n ${containerAppEnvironment} -g ${resourceGroup} -o none`;
            const exitCode = await exec.exec(`az`, command.split(' '));
            return exitCode === 0;
        } catch (err) {
            core.warning(err.message);
            return false;
        }
    }

    /**
     * Determines if the provided resource group exists.
     * @param resourceGroup - the name of the resource group
     * @returns true if the resource group exists, false otherwise
     */
    public async doesResourceGroupExist(resourceGroup: string): Promise<boolean> {
        core.debug(`Attempting to determine if resource group "${resourceGroup}" exists`);
        try {
            const command = `group show -n ${resourceGroup} -o none`;
            const exitCode = await exec.exec(`az`, command.split(' '));
            return exitCode === 0;
        } catch (err) {
            core.warning(err.message);
            return false;
        }
    }

    /**
     * Gets the default location for the Container App provider.
     * @returns the default location if found, otherwise 'eastus2'
     */
    public async getDefaultContainerAppLocation(): Promise<string> {
        core.debug(`Attempting to get the default location for the Container App service for the subscription.`);
        try {
            let args = [`provider`, `show`, `-n`, `Microsoft.App`, `--query`, `resourceTypes[?resourceType=='containerApps'].locations[] | [0]`];
            const executionResult = await new Utility().executeAndthrowIfError(`az`, args);
            // If successful, strip out double quotes, spaces and parentheses from the first location returned
            return !executionResult.stderr ? executionResult.stdout.toLowerCase().replace(/["() ]/g, "").trim() : `eastus2`;
        } catch (err) {
            core.warning(err.message);
            return `eastus2`;
        }
    }

    /**
     * Creates a new resource group in the provided location.
     * @param name - the name of the resource group to create
     * @param location - the location to create the resource group in
     */
    public async createResourceGroup(name: string, location: string) {
        core.debug(`Attempting to create resource group "${name}" in location "${location}"`);
        try {
            const command = `group create -n ${name} -l ${location}`;
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Gets the name of an existing Container App Environment in the provided resource group.
     * @param resourceGroup - the resource group to check for an existing Container App Environment
     * @returns the name of the existing Container App Environment, null if none exists
     */
    public async getExistingContainerAppEnvironment(resourceGroup: string) {
        core.debug(`Attempting to get the existing Container App Environment in resource group "${resourceGroup}"`);
        try {
            let args = [`containerapp`, `env`, `list`, `-g`, `${resourceGroup}`, `--query`, `[0].name`];
            const executionResult = await new Utility().executeAndthrowIfError(`az`, args);
            return !executionResult.stderr ? executionResult.stdout : null;
        } catch (err) {
            core.warning(err.message);
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
        core.debug(`Attempting to create Container App Environment with name "${name}" in resource group "${resourceGroup}"`);
        try {
            let args = [`containerapp`, `env`, `create`, `-n`, `${name}`, `-g`, `${resourceGroup}`];
            if (!util.isNullOrEmpty(location)) {
                args.push(`-l`, `${location}`);
            }
            await new Utility().executeAndthrowIfError(`az`, args);
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Disables ingress on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     */
    public async disableContainerAppIngress(name: string, resourceGroup: string) {
        core.debug(`Attempting to disable ingress for Container App with name "${name}" in resource group "${resourceGroup}"`);
        try {
            const command = `containerapp ingress disable -n ${name} -g ${resourceGroup}`;
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Updates the ACR details on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param acrName - the name of the Azure Container Registry (without the .azurecr.io suffix)
     * @param acrUsername - the username used to authenticate with the Azure Container Registry
     * @param acrPassword - the password used to authenticate with the Azure Container Registry
     */
    public async updateContainerAppRegistryDetails(name: string, resourceGroup: string, acrName: string, acrUsername: string, acrPassword: string) {
        core.debug(`Attempting to set the ACR details for Container App with name "${name}" in resource group "${resourceGroup}"`);
        try {
            const command = `containerapp registry set -n ${name} -g ${resourceGroup} --server ${acrName}.azurecr.io --username ${acrUsername} --password ${acrPassword}`;
            await new Utility().executeAndthrowIfError(`az`, command.split(' '));
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Using the Oryx++ Builder, creates a runnable application image from the provided application source.
     * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
     * @param appSourcePath - the path to the application source on the machine
     * @param runtimeStack - the runtime stack to use in the image layer that runs the application
     */
    public async createRunnableAppImage(
        imageToDeploy: string,
        appSourcePath: string,
        runtimeStack: string) {
        core.debug(`Attempting to create a runnable application image using the Oryx++ Builder with image name "${imageToDeploy}"`);
        try {
            let telemetryArg = `CALLER_ID=github-actions-v1`;
            if (this.disableTelemetry) {
                telemetryArg = `ORYX_DISABLE_TELEMETRY=true`;
            }
            await new Utility().executeAndthrowIfError(`${PACK_CMD}`, ['build', `${imageToDeploy}`, '--path', `${appSourcePath}`, '--builder', `${ORYX_BUILDER_IMAGE}`, '--run-image', `mcr.microsoft.com/oryx/${runtimeStack}`, '--env', `${telemetryArg}`]);
        } catch (err) {
            core.error(err.message);
            throw err;
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
        core.debug(`Attempting to create a runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
        try {
            const dockerTool = await io.which("docker", true);
            await new Utility().executeAndthrowIfError(dockerTool, ['build', '--file', `${dockerfilePath}`, `${appSourcePath}`, '--tag', `${imageToDeploy}`]);
            core.debug(`Successfully created runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
        } catch (err) {
            core.setFailed(err.message);
            throw err;
        }
    }

    /**
     * Determines the runtime stack to use for the runnable application image.
     * @param appSourcePath - the path to the application source on the machine
     * @returns a string representing the runtime stack that can be used for the Oryx MCR runtime images
     */
    public async determineRuntimeStackAsync(appSourcePath: string): Promise<string> {
        core.debug('Attempting to determine the runtime stack needed for the provided application source');
        try {
            const dockerTool: string = await io.which("docker", true);
            // Use 'oryx dockerfile' command to determine the runtime stack to use and write it to a temp file
            await new Utility().executeAndthrowIfError(dockerTool, ['run', '--rm', '-v', `${appSourcePath}:/app`, `${ORYX_CLI_IMAGE}`, '/bin/bash', '-c', `oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt`])

            // Read the temp file to get the runtime stack into a variable
            const oryxRuntimeTxtPath = path.join(appSourcePath, 'oryx-runtime.txt');

            const runtimeStack = fs.promises.readFile(oryxRuntimeTxtPath, 'utf8').then((data) => {
                const lines = data.split('\n');
                return lines[0];
            }).catch((err) => {
                core.setFailed(err.message);
                throw err;
            });

            // Delete the temp file
            fs.unlink(oryxRuntimeTxtPath, (err) => {
                if (err) {
                    core.warning(`Unable to delete the temporary file "${oryxRuntimeTxtPath}". Error: ${err.message}`);
                }
            });

            return runtimeStack;
        } catch (err) {
            core.setFailed(err.message);
            throw err;
        }
    }

    /**
     * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
     * to no default builder set.
     */
    public async setDefaultBuilder() {
        core.info('Setting the Oryx++ Builder as the default builder via the pack CLI');
        try {
            await new Utility().executeAndthrowIfError(`${PACK_CMD}`, ['config', 'default-builder', `${ORYX_BUILDER_IMAGE}`]);
        }
        catch (err) {
            core.setFailed(err.message);
            throw err;
        }
    }

    /**
     * Installs the pack CLI that will be used to build a runnable application image.
     * For more information about the pack CLI can be found here: https://buildpacks.io/docs/tools/pack/
     */
    public async installPackCliAsync() {
        core.debug('Attempting to install the pack CLI');
        try {
            let command: string = '';
            let commandLine = '';
            let args: string[] = [];
            if (IS_WINDOWS_AGENT) {
                const packZipDownloadUri: string = 'https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-windows.zip';
                const packZipDownloadFilePath: string = path.join(PACK_CMD, 'pack-windows.zip');
                args = [`New-Item`, `-ItemType`, `Directory`, `-Path`, `${PACK_CMD}`, `-Force | Out-Null;`, `Invoke-WebRequest`, `-Uri`, `${packZipDownloadUri}`, `-OutFile`, `${packZipDownloadFilePath};`, `Expand-Archive`, `-LiteralPath`, `${packZipDownloadFilePath}`, `-DestinationPath`, `${PACK_CMD};`, `Remove-Item`, `-Path`, `${packZipDownloadFilePath}`,
                    `Expand-Archive`, `-LiteralPath`, `${packZipDownloadFilePath}`, `-DestinationPath`, `${PACK_CMD};`, `Remove-Item`, `-Path`, `${packZipDownloadFilePath}`];
                commandLine = 'pwsh';
            } else {
                const tgzSuffix = os.platform() == 'darwin' ? 'macos' : 'linux';
                command = `(curl -sSL \"https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-${tgzSuffix}.tgz\" | ` +
                    'tar -C /usr/local/bin/ --no-same-owner -xzv pack)';
                args = ['-c', command];
                commandLine = 'bash';
            }
            await new Utility().executeAndthrowIfError(commandLine, args);
        } catch (err) {
            core.error(`Unable to install the pack CLI. Error: ${err.message}`);
            core.setFailed(err.message);
            throw err;
        }
    }
}