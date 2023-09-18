import * as core from '@actions/core';
import * as exec from '@actions/exec'
import * as io from '@actions/io';
import * as path from 'path';
import * as os from 'os';
import { CommandHelper } from './CommandHelper';
import { Utility } from './Utility';
const util = require('util');
const cpExec = util.promisify(require('child_process').exec);
import { pathToFileURL } from 'url';
import { cp } from 'fs';

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
                let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} -i ${imageToDeploy} --environment ${environment}`;
                optionalCmdArgs.forEach(function (val: string) {
                    command += ` ${val}`;
                });
                await cpExec(`${command}`);
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
                let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath}`;
                await cpExec(`${command}`);
                // new Utility().executeAndthrowIfError(
                //     await io.which('az', true),
                //     command,
                //     "Unable to create Azure Container App from YAML configuration file via 'az containerapp create' command."
                // );
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
                const pathToTool = await io.which('az', true);

                new Utility().executeAndthrowIfError(
                    pathToTool,
                    command,
                    "Unable to update Azure Container App via 'az containerapp update' command."
                );
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

                const pathToTool = await io.which('az', true);

                util.executeAndthrowIfError(
                    pathToTool,
                    command,
                    "Unable to update Azure Container App via 'az containerapp up' command."
                );
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
                const pathToTool = await io.which('az', true);
                new Utility().executeAndthrowIfError(
                    pathToTool,
                    command,
                    "Unable to update Azure Container App from YAML configuration file via 'az containerapp update' command."
                );
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
            const command = `az containerapp show -n ${containerAppName} -g ${resourceGroup} -o none`;
            const {stdout, stderr} = await cpExec(`${command}`);
            return !stderr;
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
            const pathToTool = await io.which('az', true);
            const result = await new Utility().executeAndReturnExitCode(pathToTool, command);
            return result == 0;
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
            const command = `az group show -n ${resourceGroup} -o none`;
            const {stdout, stderr} = await cpExec(`${command}`);
            return !stderr;
            // const pathToTool = await io.which('az', true);
            // const result = await new Utility().executeAndReturnExitCode(pathToTool, command);
            // return result == 0;
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
            const command = `az provider show -n Microsoft.App --query "resourceTypes[?resourceType=='containerApps'].locations[] | [0]"`
            const {stdout, stderr} = await cpExec(`${command}`);
            // If successful, strip out double quotes, spaces and parentheses from the first location returned
            return !stderr ? stdout.toLowerCase().replace(/["() ]/g, "") : `eastus2`;
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
            const command = `az group create -n ${name} -l ${location}`;
            await cpExec(`${command}`);
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
            const command = `az containerapp env list -g ${resourceGroup} --query [0].name"`;
            const {stdout, stderr} = await cpExec(`${command}`);
            return !stderr ? stdout : null;
            // const pathToTool = await io.which('az', true);
            // const result = await new Utility().executeAndReturnExitCode(
            //     pathToTool,
            //     command,
            //     `Unable to get the existing Container App Environment in resource group "${resourceGroup}".`
            // );
            // const output = await new Utility().executeAndReturnOutput(pathToTool, command);
            // return result == 0 ? output : null;
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
            let command = `containerapp env create -n ${name} -g ${resourceGroup}`;
            if (!util.isNullOrEmpty(location)) {
                command += ` -l ${location}`;
            }

            util.executeAndthrowIfError(
                await io.which('az', true),
                command,
                `Unable to create Azure Container App Environment via 'az containerapp env create' command.`
            );
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
            new Utility().executeAndthrowIfError(
                await io.which('az', true),
                command,
                `Unable to disable ingress for Container App via 'az containerapp ingress disable' command.`
            );
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
            const pathToTool = await io.which('az', true);
            new Utility().executeAndthrowIfError(
                pathToTool,
                command,
                `Unable to set the ACR details for Container App via 'az containerapp registry set' command.`
            );
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
    public createRunnableAppImage(
        imageToDeploy: string,
        appSourcePath: string,
        runtimeStack: string) {
            core.debug(`Attempting to create a runnable application image using the Oryx++ Builder with image name "${imageToDeploy}"`);
            try {
                let telemetryArg = `--env "CALLER_ID=azure-pipelines-rc-v1"`;
                if (this.disableTelemetry) {
                    telemetryArg = `--env "ORYX_DISABLE_TELEMETRY=true"`;
                }

                new Utility().executeAndthrowIfError(
                    `${PACK_CMD}`,
                    `build ${imageToDeploy} --path ${appSourcePath} --builder ${ORYX_BUILDER_IMAGE} --run-image mcr.microsoft.com/oryx/${runtimeStack} ${telemetryArg}`,
                    `Unable to create runnable application image using the Oryx++ Builder with image name "${imageToDeploy}".`
                );
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
                exec.exec('docker', ['build', '--file', `${dockerfilePath}`, `${appSourcePath}`, '--tag', `${imageToDeploy}`])
            } catch (err) {
                core.error(err.message);
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
            const dockerCommand: string = `run --rm -v ${appSourcePath}:/app ${ORYX_CLI_IMAGE} /bin/bash -c "oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt"`;
            exec.exec('docker', ['run', '--rm', '-v', `${appSourcePath}:/app`, `${ORYX_CLI_IMAGE}`, '/bin/bash', '-c', `"oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt"`])
            // new Utility().executeAndthrowIfError(
            //     `${dockerTool}`,
            //     `${dockerCommand}`,
            //     `Unable to determine the runtime stack needed for the provided application source.`
            // );

            // Read the temp file to get the runtime stack into a variable
            const oryxRuntimeTxtPath = path.join(appSourcePath, 'oryx-runtime.txt');
            let command: string = `head -n 1 ${oryxRuntimeTxtPath}`;
            if (IS_WINDOWS_AGENT) {
                command = `Get-Content -Path ${oryxRuntimeTxtPath} -Head 1`;
            }

            const runtimeStack = await new CommandHelper().execCommandAsync(command);

            // Delete the temp file
            command = `rm ${oryxRuntimeTxtPath}`;
            if (IS_WINDOWS_AGENT) {
                command = `Remove-Item -Path ${oryxRuntimeTxtPath}`;
            }

            await new CommandHelper().execCommandAsync(command);

            return runtimeStack;
        } catch (err) {
            core.error(err.message);
            throw err;
        }
    }

    /**
     * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
     * to no default builder set.
     */
     public setDefaultBuilder() {
        core.debug('Setting the Oryx++ Builder as the default builder via the pack CLI');
        try {
            new Utility().executeAndthrowIfError(
                `${PACK_CMD}`,
                `config default-builder ${ORYX_BUILDER_IMAGE}`,
                `Unable to set the Oryx++ Builder as the default builder via the pack CLI.`
            );

        } catch (err) {
            core.error(err.message);
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
            if (IS_WINDOWS_AGENT) {
                const packZipDownloadUri: string = 'https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-windows.zip';
                const packZipDownloadFilePath: string = path.join(PACK_CMD, 'pack-windows.zip');

                command = `New-Item -ItemType Directory -Path ${PACK_CMD} -Force | Out-Null;` +
                          `Invoke-WebRequest -Uri ${packZipDownloadUri} -OutFile ${packZipDownloadFilePath}; ` +
                          `Expand-Archive -LiteralPath ${packZipDownloadFilePath} -DestinationPath ${PACK_CMD}; ` +
                          `Remove-Item -Path ${packZipDownloadFilePath}`;
            } else {
                const tgzSuffix = os.platform() == 'darwin' ? 'macos' : 'linux';
                command = `(curl -sSL \"https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-${tgzSuffix}.tgz\" | ` +
                                  'tar -C /usr/local/bin/ --no-same-owner -xzv pack)';
            }
            await new CommandHelper().execCommandAsync(command);
        } catch (err) {
            core.error(`Unable to install the pack CLI.`)
            throw err;
        }
    }
}