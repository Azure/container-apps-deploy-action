var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("src/GitHubActionsToolHelper", ["@actions/core", "@actions/io", "@actions/exec"], function (exports_1, context_1) {
    "use strict";
    var core, io, exec, GitHubActionsToolHelper;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1) {
                core = core_1;
            },
            function (io_1) {
                io = io_1;
            },
            function (exec_1) {
                exec = exec_1;
            }
        ],
        execute: function () {
            GitHubActionsToolHelper = class GitHubActionsToolHelper {
                getBuildId() {
                    return process.env['GITHUB_RUN_ID'] || '';
                }
                getBuildNumber() {
                    return process.env['GITHUB_RUN_NUMBER'] || '';
                }
                writeInfo(message) {
                    core.info(message);
                }
                writeError(message) {
                    core.error(message);
                }
                writeWarning(message) {
                    core.warning(message);
                }
                writeDebug(message) {
                    core.debug(message);
                }
                exec(commandLine, args, inputOptions) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let stdout = '';
                            let stderr = '';
                            const options = {
                                listeners: {
                                    stdout: (data) => {
                                        stdout += data.toString().replace(/(\r\n|\n|\r)/gm, "");
                                    },
                                    stderr: (data) => {
                                        stderr += data.toString();
                                    },
                                },
                                input: inputOptions
                            };
                            let exitCode = yield exec.exec(commandLine, args, options);
                            return new Promise((resolve, reject) => {
                                let executionResult = {
                                    exitCode: exitCode,
                                    stdout: stdout,
                                    stderr: stderr
                                };
                                resolve(executionResult);
                            });
                        }
                        catch (err) {
                            throw err;
                        }
                    });
                }
                getInput(name, required) {
                    const options = {
                        required: required
                    };
                    return core.getInput(name, options);
                }
                setFailed(message) {
                    core.setFailed(message);
                }
                which(tool, check) {
                    return io.which(tool, check);
                }
                getDefaultContainerAppName(containerAppName) {
                    containerAppName = `gh-action-app-${this.getBuildId()}-${this.getBuildNumber()}`;
                    // Replace all '.' characters with '-' characters in the Container App name
                    containerAppName = containerAppName.replace(/\./gi, "-");
                    this.writeInfo(`Default Container App name: ${containerAppName}`);
                    return containerAppName;
                }
                getTelemetryArg() {
                    return `CALLER_ID=github-actions-v2`;
                }
                getEventName() {
                    return `ContainerAppsGitHubActionV2`;
                }
                getDefaultImageRepository() {
                    return `gh-action/container-app`;
                }
            };
            exports_1("GitHubActionsToolHelper", GitHubActionsToolHelper);
        }
    };
});
System.register("src/Utility", ["src/GitHubActionsToolHelper"], function (exports_2, context_2) {
    "use strict";
    var GitHubActionsToolHelper_1, toolHelper, Utility;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (GitHubActionsToolHelper_1_1) {
                GitHubActionsToolHelper_1 = GitHubActionsToolHelper_1_1;
            }
        ],
        execute: function () {
            toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
            Utility = class Utility {
                /**
                 * @param commandLine - the command to execute
                 * @param args - the arguments to pass to the command
                 * @param continueOnError - whether or not to continue execution if the command fails
                 */
                execute(commandLine, args, inputOptions) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield toolHelper.exec(commandLine, args, inputOptions);
                    });
                }
                /**
                 * Sets the Azure CLI to install the containerapp extension.
                 */
                installAzureCliExtension() {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.execute(`az extension add --name containerapp --upgrade`);
                    });
                }
                /**
                 * Checks whether or not the provided string is null, undefined or empty.
                 * @param str - the string to validate
                 * @returns true if the string is null, undefined or empty, false otherwise
                 */
                isNullOrEmpty(str) {
                    return str === null || str === undefined || str === "";
                }
            };
            exports_2("Utility", Utility);
        }
    };
});
System.register("src/ContainerAppHelper", ["path", "os", "src/Utility", "src/GitHubActionsToolHelper", "fs"], function (exports_3, context_3) {
    "use strict";
    var path, os, Utility_1, GitHubActionsToolHelper_2, fs, ORYX_CLI_IMAGE, ORYX_BULLSEYE_BUILDER_IMAGE, ORYX_BOOKWORM_BUILDER_IMAGE, ORYX_BUILDER_IMAGES, IS_WINDOWS_AGENT, PACK_CMD, toolHelper, util, ContainerAppHelper;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (path_1) {
                path = path_1;
            },
            function (os_1) {
                os = os_1;
            },
            function (Utility_1_1) {
                Utility_1 = Utility_1_1;
            },
            function (GitHubActionsToolHelper_2_1) {
                GitHubActionsToolHelper_2 = GitHubActionsToolHelper_2_1;
            },
            function (fs_1) {
                fs = fs_1;
            }
        ],
        execute: function () {
            ORYX_CLI_IMAGE = 'mcr.microsoft.com/oryx/cli:builder-debian-bullseye-20230926.1';
            ORYX_BULLSEYE_BUILDER_IMAGE = 'mcr.microsoft.com/oryx/builder:debian-bullseye-20240124.1';
            ORYX_BOOKWORM_BUILDER_IMAGE = 'mcr.microsoft.com/oryx/builder:debian-bookworm-20240124.1';
            ORYX_BUILDER_IMAGES = [ORYX_BULLSEYE_BUILDER_IMAGE, ORYX_BOOKWORM_BUILDER_IMAGE];
            IS_WINDOWS_AGENT = os.platform() == 'win32';
            PACK_CMD = IS_WINDOWS_AGENT ? path.join(os.tmpdir(), 'pack') : 'pack';
            toolHelper = new GitHubActionsToolHelper_2.GitHubActionsToolHelper();
            util = new Utility_1.Utility();
            ContainerAppHelper = class ContainerAppHelper {
                constructor(disableTelemetry) {
                    this.disableTelemetry = false;
                    this.disableTelemetry = disableTelemetry;
                }
                /**
                 * Creates an Azure Container App.
                 * @param containerAppName - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                 * @param environment - the Container App Environment that will be associated with the Container App
                 * @param optionalCmdArgs - a set of optional command line arguments
                 */
                createContainerApp(containerAppName, resourceGroup, environment, optionalCmdArgs) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} --environment ${environment} --output none`;
                            optionalCmdArgs.forEach(function (val) {
                                command += ` ${val}`;
                            });
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                * Creates an Azure Container App.
                * @param containerAppName - the name of the Container App
                * @param resourceGroup - the resource group that the Container App is found in
                * @param optionalCmdArgs - a set of optional command line arguments
                */
                createOrUpdateContainerAppWithUp(containerAppName, resourceGroup, optionalCmdArgs) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp up -n ${containerAppName} -g ${resourceGroup}`;
                            optionalCmdArgs.forEach(function (val) {
                                command += ` ${val}`;
                            });
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Get the current subscription
                 * @returns the current subscription
                 */
                getCurrentSubscription() {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to get the default subscription`);
                        try {
                            let command = ` az account show --query id --output tsv `;
                            let executionResult = yield util.execute(command);
                            // If successful, strip out double quotes, spaces and parentheses from the first location returned
                            return executionResult.exitCode === 0 ? executionResult.stdout.toLowerCase() : ``;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return ``;
                        }
                    });
                }
                /**
                 * Creates an Azure Container App based from a YAML configuration file.
                 * @param containerAppName - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                 * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
                 */
                createContainerAppFromYaml(containerAppName, resourceGroup, yamlConfigPath) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to create Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
                        try {
                            let command = `az containerapp create -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath} --output none`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Updates an existing Azure Container App based from an image that was previously built.
                 * @param containerAppName - the name of the existing Container App
                 * @param resourceGroup - the resource group that the existing Container App is found in
                 * @param optionalCmdArgs - a set of optional command line arguments
                 */
                updateContainerApp(containerAppName, resourceGroup, optionalCmdArgs) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" `);
                        try {
                            let command = `az containerapp update -n ${containerAppName} -g ${resourceGroup} --output none`;
                            optionalCmdArgs.forEach(function (val) {
                                command += ` ${val}`;
                            });
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Updates an existing Azure Container App using the 'az containerapp up' command.
                 * @param containerAppName - the name of the existing Container App
                 * @param resourceGroup - the resource group that the existing Container App is found in
                 * @param optionalCmdArgs - a set of optional command line arguments
                 * @param ingress - the ingress that the Container App will be exposed on
                 * @param targetPort - the target port that the Container App will be exposed on
                 */
                updateContainerAppWithUp(containerAppName, resourceGroup, optionalCmdArgs, ingress, targetPort) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp up -n ${containerAppName} -g ${resourceGroup}`;
                            optionalCmdArgs.forEach(function (val) {
                                command += ` ${val}`;
                            });
                            if (!util.isNullOrEmpty(ingress)) {
                                command += ` --ingress ${ingress}`;
                            }
                            if (!util.isNullOrEmpty(targetPort)) {
                                command += ` --target-port ${targetPort}`;
                            }
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Update container app with update and ingress update to avoid failure of acr authentication.
                 * @param containerAppName - the name of the existing Container App
                 * @param resourceGroup - the resource group that the existing Container App is found in
                 * @param ingress - the ingress that the Container App will be exposed on
                 * @param targetPort - the target port that the Container App will be exposed on
                 */
                updateContainerAppIngress(containerAppName, resourceGroup, ingress, targetPort) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to update Container App ingress with name "${containerAppName}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp ingress update -n ${containerAppName} -g ${resourceGroup}`;
                            if (!util.isNullOrEmpty(ingress)) {
                                command += ` --type ${ingress}`;
                            }
                            if (!util.isNullOrEmpty(targetPort)) {
                                command += ` --target-port ${targetPort}`;
                            }
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Updates an existing Azure Container App based from a YAML configuration file.
                 * @param containerAppName - the name of the existing Container App
                 * @param resourceGroup - the resource group that the existing Container App is found in
                 * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
                 */
                updateContainerAppFromYaml(containerAppName, resourceGroup, yamlConfigPath) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to update Container App with name "${containerAppName}" in resource group "${resourceGroup}" from provided YAML "${yamlConfigPath}"`);
                        try {
                            let command = `az containerapp update -n ${containerAppName} -g ${resourceGroup} --yaml ${yamlConfigPath} --output none`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Determines if the provided Container App exists in the provided resource group.
                 * @param containerAppName - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                 * @returns true if the Container App exists, false otherwise
                 */
                doesContainerAppExist(containerAppName, resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to determine if Container App with name "${containerAppName}" exists in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp show -n ${containerAppName} -g ${resourceGroup} -o none`;
                            let executionResult = yield util.execute(command);
                            return executionResult.exitCode === 0;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return false;
                        }
                    });
                }
                /**
                 * Determines if the provided Container App Environment exists in the provided resource group.
                 * @param containerAppEnvironment - the name of the Container App Environment
                 * @param resourceGroup - the resource group that the Container App Environment is found in
                 * @returns true if the Container App Environment exists, false otherwise
                 */
                doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to determine if Container App Environment with name "${containerAppEnvironment}" exists in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp env show -o none -g ${resourceGroup} -n ${containerAppEnvironment}`;
                            let executionResult = yield util.execute(command);
                            return executionResult.exitCode === 0;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return false;
                        }
                    });
                }
                /**
                 * Determines if the provided resource group exists.
                 * @param resourceGroup - the name of the resource group
                 * @returns true if the resource group exists, false otherwise
                 */
                doesResourceGroupExist(resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to determine if resource group "${resourceGroup}" exists`);
                        try {
                            let command = `az group show -n ${resourceGroup} -o none`;
                            let executionResult = yield util.execute(command);
                            return executionResult.exitCode === 0;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return false;
                        }
                    });
                }
                /**
                 * Gets the default location for the Container App provider.
                 * @returns the default location if found, otherwise 'eastus2'
                 */
                getDefaultContainerAppLocation() {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to get the default location for the Container App service for the subscription.`);
                        try {
                            let command = `az provider show -n Microsoft.App --query "resourceTypes[?resourceType=='containerApps'].locations[] | [0]"`;
                            let executionResult = yield util.execute(command);
                            // If successful, strip out double quotes, spaces and parentheses from the first location returned
                            return executionResult.exitCode === 0 ? executionResult.stdout.toLowerCase().replace(/["() ]/g, "").trim() : `eastus2`;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return `eastus2`;
                        }
                    });
                }
                /**
                 * Creates a new resource group in the provided location.
                 * @param name - the name of the resource group to create
                 * @param location - the location to create the resource group in
                 */
                createResourceGroup(name, location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to create resource group "${name}" in location "${location}"`);
                        try {
                            let command = `az group create -n ${name} -l ${location}`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Gets the name of an existing Container App Environment in the provided resource group.
                 * @param resourceGroup - the resource group to check for an existing Container App Environment
                 * @returns the name of the existing Container App Environment, null if none exists
                 */
                getExistingContainerAppEnvironment(resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to get the existing Container App Environment in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp env list -g ${resourceGroup} --query "[0].name"`;
                            let executionResult = yield util.execute(command);
                            return executionResult.exitCode === 0 ? executionResult.stdout : null;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return null;
                        }
                    });
                }
                /**
                 * Gets the location of an existing Container App Environment
                 * @param environmentName - the name of the Container App Environment
                 * @param resourceGroup - the resource group that the Container App Environment is found in
                */
                getExistingContainerAppEnvironmentLocation(environmentName, resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let command = `az containerapp env show -g ${resourceGroup} --query location -n ${environmentName}`;
                            let executionResult = yield util.execute(command);
                            return executionResult.exitCode === 0 ? executionResult.stdout.toLowerCase().replace(/["() ]/g, "").trim() : null;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return null;
                        }
                    });
                }
                /**
                 * Gets the environment name of an existing Container App
                 * @param containerAppName - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                */
                getExistingContainerAppEnvironmentName(containerAppName, resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let command = `az containerapp show -n ${containerAppName} -g ${resourceGroup} --query properties.environmentId`;
                            let executionResult = yield util.execute(command);
                            let containerappEnvironmentId = executionResult.stdout.trim();
                            //Remove trailing slash if it exists
                            if (!util.isNullOrEmpty(containerappEnvironmentId)) {
                                containerappEnvironmentId = containerappEnvironmentId.endsWith("/") ? containerappEnvironmentId.slice(0, -1) : containerappEnvironmentId;
                            }
                            return executionResult.exitCode === 0 ? containerappEnvironmentId.split("/").pop().trim() : null;
                        }
                        catch (err) {
                            toolHelper.writeInfo(err.message);
                            return null;
                        }
                    });
                }
                /**
                 * Creates a new Azure Container App Environment in the provided resource group.
                 * @param name - the name of the Container App Environment
                 * @param resourceGroup - the resource group that the Container App Environment will be created in
                 * @param location - the location that the Container App Environment will be created in
                 */
                createContainerAppEnvironment(name, resourceGroup, location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const util = new Utility_1.Utility();
                        toolHelper.writeDebug(`Attempting to create Container App Environment with name "${name}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp env create -n ${name} -g ${resourceGroup}`;
                            if (!util.isNullOrEmpty(location)) {
                                command += ` -l ${location}`;
                            }
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Disables ingress on an existing Container App.
                 * @param name - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                 */
                disableContainerAppIngress(name, resourceGroup) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to disable ingress for Container App with name "${name}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp ingress disable -n ${name} -g ${resourceGroup}`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Updates the Container Registry details on an existing Container App.
                 * @param name - the name of the Container App
                 * @param resourceGroup - the resource group that the Container App is found in
                 * @param registryUrl - the name of the Container Registry
                 * @param registryUsername - the username used to authenticate with the Container Registry
                 * @param registryPassword - the password used to authenticate with the Container Registry
                 */
                updateContainerAppRegistryDetails(name, resourceGroup, registryUrl, registryUsername, registryPassword) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to set the Container Registry details for Container App with name "${name}" in resource group "${resourceGroup}"`);
                        try {
                            let command = `az containerapp registry set -n ${name} -g ${resourceGroup} --server ${registryUrl} --username ${registryUsername} --password ${registryPassword}`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Using the Oryx++ Builder, creates a runnable application image from the provided application source.
                 * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
                 * @param appSourcePath - the path to the application source on the machine
                 * @param environmentVariables - an array of environment variables that should be provided to the builder via the `--env` flag
                 * @param builderStack - the stack to use when building the provided application source
                 */
                createRunnableAppImage(imageToDeploy, appSourcePath, environmentVariables, builderStack) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let telemetryArg = toolHelper.getTelemetryArg();
                        if (this.disableTelemetry) {
                            telemetryArg = `ORYX_DISABLE_TELEMETRY=true`;
                        }
                        let subscription = yield this.getCurrentSubscription();
                        let couldBuildImage = false;
                        for (const builderImage of ORYX_BUILDER_IMAGES) {
                            if (!util.isNullOrEmpty(builderStack) && !builderImage.includes(builderStack)) {
                                continue;
                            }
                            toolHelper.writeDebug(`Attempting to create a runnable application image with name "${imageToDeploy}" using the Oryx++ Builder "${builderImage}"`);
                            try {
                                let command = `build ${imageToDeploy} --path ${appSourcePath} --builder ${builderImage} --env ${telemetryArg} --env BP_SUBSCRIPTION_ID=${subscription}`;
                                environmentVariables.forEach(function (envVar) {
                                    command += ` --env ${envVar}`;
                                });
                                yield util.execute(`${PACK_CMD} ${command}`);
                                couldBuildImage = true;
                                break;
                            }
                            catch (err) {
                                toolHelper.writeWarning(`Unable to run 'pack build' command to produce runnable application image: ${err.message}`);
                            }
                        }
                        ;
                        // If none of the builder images were able to build the provided application source, throw an error.
                        if (!couldBuildImage) {
                            const errorMessage = `No builder was able to build the provided application source. Please visit the following page for more information on supported platform versions: https://aka.ms/SourceToCloudSupportedVersions`;
                            toolHelper.writeError(errorMessage);
                            throw new Error(errorMessage);
                        }
                    });
                }
                /**
                 * Using a Dockerfile that was provided or found at the root of the application source,
                 * creates a runable application image.
                 * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
                 * @param appSourcePath - the path to the application source on the machine
                 * @param dockerfilePath - the path to the Dockerfile to build and tag with the provided image name
                 * @param buildArguments - an array of build arguments that should be provided to the docker build command via the `--build-arg` flag
                 */
                createRunnableAppImageFromDockerfile(imageToDeploy, appSourcePath, dockerfilePath, buildArguments) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to create a runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
                        try {
                            let command = `docker build --file ${dockerfilePath} ${appSourcePath} --tag ${imageToDeploy}`;
                            // If build arguments were provided, append them to the command
                            if (buildArguments.length > 0) {
                                buildArguments.forEach(function (buildArg) {
                                    command += ` --build-arg ${buildArg}`;
                                });
                            }
                            yield util.execute(command);
                            toolHelper.writeDebug(`Successfully created runnable application image from the provided/found Dockerfile "${dockerfilePath}" with image name "${imageToDeploy}"`);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Determines the runtime stack to use for the runnable application image.
                 * @param appSourcePath - the path to the application source on the machine
                 * @returns a string representing the runtime stack that can be used for the Oryx MCR runtime images
                 */
                determineRuntimeStackAsync(appSourcePath) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug('Attempting to determine the runtime stack needed for the provided application source');
                        try {
                            // Use 'oryx dockerfile' command to determine the runtime stack to use and write it to a temp file
                            let command = `docker run --rm -v ${appSourcePath}:/app ${ORYX_CLI_IMAGE} /bin/bash -c "oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt"`;
                            yield util.execute(command);
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
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
                 * to no default builder set.
                 */
                setDefaultBuilder() {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeInfo('Setting the Oryx++ Builder as the default builder via the pack CLI');
                        try {
                            let command = `config default-builder ${ORYX_BUILDER_IMAGES[0]}`;
                            yield util.execute(`${PACK_CMD} ${command}`);
                        }
                        catch (err) {
                            toolHelper.writeError(err.message);
                            throw err;
                        }
                    });
                }
                /**
                 * Installs the pack CLI that will be used to build a runnable application image.
                 * For more Information about the pack CLI can be found here: https://buildpacks.io/docs/tools/pack/
                 */
                installPackCliAsync() {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug('Attempting to install the pack CLI');
                        try {
                            let command = '';
                            let commandLine = '';
                            if (IS_WINDOWS_AGENT) {
                                let packZipDownloadUri = 'https://github.com/buildpacks/pack/releases/download/v0.31.0/pack-v0.31.0-windows.zip';
                                let packZipDownloadFilePath = path.join(PACK_CMD, 'pack-windows.zip');
                                command = `New-Item -ItemType Directory -Path ${PACK_CMD} -Force | Out-Null; Invoke-WebRequest -Uri ${packZipDownloadUri} -OutFile ${packZipDownloadFilePath}; Expand-Archive -LiteralPath ${packZipDownloadFilePath} -DestinationPath ${PACK_CMD}; Remove-Item -Path ${packZipDownloadFilePath}`;
                                commandLine = 'pwsh';
                            }
                            else {
                                let tgzSuffix = os.platform() == 'darwin' ? 'macos' : 'linux';
                                command = `(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.31.0/pack-v0.31.0-${tgzSuffix}.tgz" | ` +
                                    'tar -C /usr/local/bin/ --no-same-owner -xzv pack)';
                                commandLine = 'bash';
                            }
                            yield util.execute(`${commandLine} -c "${command}"`);
                        }
                        catch (err) {
                            toolHelper.writeError(`Unable to install the pack CLI. Error: ${err.message}`);
                            throw err;
                        }
                    });
                }
                /**
                 * Enables experimental features for the pack CLI, such as extension support.
                 */
                enablePackCliExperimentalFeaturesAsync() {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug('Attempting to enable experimental features for the pack CLI');
                        try {
                            let command = `${PACK_CMD} config experimental true`;
                            yield util.execute(command);
                        }
                        catch (err) {
                            toolHelper.writeError(`Unable to enable experimental features for the pack CLI: ${err.message}`);
                            throw err;
                        }
                    });
                }
            };
            exports_3("ContainerAppHelper", ContainerAppHelper);
        }
    };
});
System.register("src/ContainerRegistryHelper", ["os", "src/Utility", "src/GitHubActionsToolHelper"], function (exports_4, context_4) {
    "use strict";
    var os, Utility_2, GitHubActionsToolHelper_3, toolHelper, util, ContainerRegistryHelper;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (os_2) {
                os = os_2;
            },
            function (Utility_2_1) {
                Utility_2 = Utility_2_1;
            },
            function (GitHubActionsToolHelper_3_1) {
                GitHubActionsToolHelper_3 = GitHubActionsToolHelper_3_1;
            }
        ],
        execute: function () {
            toolHelper = new GitHubActionsToolHelper_3.GitHubActionsToolHelper();
            util = new Utility_2.Utility();
            ContainerRegistryHelper = class ContainerRegistryHelper {
                /**
                 * Authorizes Docker to make calls to the provided Container Registry instance using username and password.
                 * @param registryUrl - the name of the Container Registry instance to authenticate calls to
                 * @param registryUsername - the username for authentication
                 * @param registryPassword - the password for authentication
                 */
                loginContainerRegistryWithUsernamePassword(registryUrl, registryUsername, registryPassword) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to log in to Container Registry instance"${registryUrl}" with username and password credentials`);
                        try {
                            yield util.execute(`docker login --password-stdin --username ${registryUsername} ${registryUrl}`, [], Buffer.from(registryPassword));
                        }
                        catch (err) {
                            toolHelper.writeError(`Failed to log in to Container Registry instance "${registryUrl}" with username and password credentials`);
                            throw err;
                        }
                    });
                }
                /**
                 * Authorizes Docker to make calls to the provided ACR instance using an access token that is generated via
                 * the 'az acr login --expose-token' command.
                 * @param acrName - the name of the ACR instance to authenticate calls to.
                 */
                loginAcrWithAccessTokenAsync(acrName) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to log in to ACR instance "${acrName}" with access token`);
                        try {
                            let commandLine = os.platform() === 'win32' ? 'pwsh' : 'bash';
                            yield util.execute(`${commandLine} -c "CA_ADO_TASK_ACR_ACCESS_TOKEN=$(az acr login --name ${acrName} --output json --expose-token --only-show-errors | jq -r '.accessToken'); docker login ${acrName}.azurecr.io -u 00000000-0000-0000-0000-000000000000 -p $CA_ADO_TASK_ACR_ACCESS_TOKEN > /dev/null 2>&1"`);
                        }
                        catch (err) {
                            toolHelper.writeError(`Failed to log in to ACR instance "${acrName}" with access token`);
                            throw err;
                        }
                    });
                }
                /**
                 * Pushes an image to the Container Registry instance that was previously authenticated against.
                 * @param imageToPush - the name of the image to push to the Container Registry instance
                 */
                pushImageToContainerRegistry(imageToPush) {
                    return __awaiter(this, void 0, void 0, function* () {
                        toolHelper.writeDebug(`Attempting to push image "${imageToPush}" to Container Registry`);
                        try {
                            yield util.execute(`docker push ${imageToPush}`);
                        }
                        catch (err) {
                            toolHelper.writeError(`Failed to push image "${imageToPush}" to Container Registry. Error: ${err.message}`);
                            throw err;
                        }
                    });
                }
            };
            exports_4("ContainerRegistryHelper", ContainerRegistryHelper);
        }
    };
});
System.register("src/TelemetryHelper", ["src/Utility", "src/GitHubActionsToolHelper"], function (exports_5, context_5) {
    "use strict";
    var Utility_3, GitHubActionsToolHelper_4, ORYX_CLI_IMAGE, SUCCESSFUL_RESULT, FAILED_RESULT, BUILDER_SCENARIO, DOCKERFILE_SCENARIO, IMAGE_SCENARIO, util, toolHelper, TelemetryHelper;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (Utility_3_1) {
                Utility_3 = Utility_3_1;
            },
            function (GitHubActionsToolHelper_4_1) {
                GitHubActionsToolHelper_4 = GitHubActionsToolHelper_4_1;
            }
        ],
        execute: function () {
            ORYX_CLI_IMAGE = "mcr.microsoft.com/oryx/cli:debian-buster-20230207.2";
            SUCCESSFUL_RESULT = "succeeded";
            FAILED_RESULT = "failed";
            BUILDER_SCENARIO = "used-builder";
            DOCKERFILE_SCENARIO = "used-dockerfile";
            IMAGE_SCENARIO = "used-image";
            util = new Utility_3.Utility();
            toolHelper = new GitHubActionsToolHelper_4.GitHubActionsToolHelper();
            TelemetryHelper = class TelemetryHelper {
                constructor(disableTelemetry) {
                    this.disableTelemetry = disableTelemetry;
                    this.taskStartMilliseconds = Date.now();
                }
                /**
                 * Marks that the task was successful in telemetry.
                 */
                setSuccessfulResult() {
                    this.result = SUCCESSFUL_RESULT;
                }
                /**
                 * Marks that the task failed in telemetry.
                 */
                setFailedResult(errorMessage) {
                    this.result = FAILED_RESULT;
                    this.errorMessage = errorMessage;
                }
                /**
                 * Marks that the task used the builder scenario.
                 */
                setBuilderScenario() {
                    this.scenario = BUILDER_SCENARIO;
                }
                /**
                 * Marks that the task used the Dockerfile scenario.
                 */
                setDockerfileScenario() {
                    this.scenario = DOCKERFILE_SCENARIO;
                }
                /**
                 * Marks that the task used the previously built image scenario.
                 */
                setImageScenario() {
                    this.scenario = IMAGE_SCENARIO;
                }
                /**
                 * If telemetry is enabled, uses the "oryx telemetry" command to log metadata about this task execution.
                 */
                sendLogs() {
                    return __awaiter(this, void 0, void 0, function* () {
                        let taskLengthMilliseconds = Date.now() - this.taskStartMilliseconds;
                        if (!this.disableTelemetry) {
                            toolHelper.writeInfo(`Telemetry enabled; logging metadata about task result, length and scenario targeted.`);
                            try {
                                let resultArg = '';
                                if (!util.isNullOrEmpty(this.result)) {
                                    resultArg = `--property result=${this.result}`;
                                }
                                let scenarioArg = '';
                                if (!util.isNullOrEmpty(this.scenario)) {
                                    scenarioArg = `--property scenario=${this.scenario}`;
                                }
                                let errorMessageArg = '';
                                if (!util.isNullOrEmpty(this.errorMessage)) {
                                    errorMessageArg = `--property errorMessage=${this.errorMessage}`;
                                }
                                let eventName = toolHelper.getEventName();
                                yield util.execute(`docker run --rm ${ORYX_CLI_IMAGE} /bin/bash -c "oryx telemetry --event-name ${eventName} --processing-time ${taskLengthMilliseconds} ${resultArg} ${scenarioArg} ${errorMessageArg}"`);
                            }
                            catch (err) {
                                toolHelper.writeWarning(`Skipping telemetry logging due to the following exception: ${err.message}`);
                            }
                        }
                    });
                }
            };
            exports_5("TelemetryHelper", TelemetryHelper);
        }
    };
});
System.register("azurecontainerapps", ["fs", "path", "src/ContainerAppHelper", "src/ContainerRegistryHelper", "src/TelemetryHelper", "src/Utility", "src/GitHubActionsToolHelper"], function (exports_6, context_6) {
    "use strict";
    var fs, path, ContainerAppHelper_1, ContainerRegistryHelper_1, TelemetryHelper_1, Utility_4, GitHubActionsToolHelper_5, buildArgumentRegex, buildpackEnvironmentNameRegex, azurecontainerapps;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (fs_2) {
                fs = fs_2;
            },
            function (path_2) {
                path = path_2;
            },
            function (ContainerAppHelper_1_1) {
                ContainerAppHelper_1 = ContainerAppHelper_1_1;
            },
            function (ContainerRegistryHelper_1_1) {
                ContainerRegistryHelper_1 = ContainerRegistryHelper_1_1;
            },
            function (TelemetryHelper_1_1) {
                TelemetryHelper_1 = TelemetryHelper_1_1;
            },
            function (Utility_4_1) {
                Utility_4 = Utility_4_1;
            },
            function (GitHubActionsToolHelper_5_1) {
                GitHubActionsToolHelper_5 = GitHubActionsToolHelper_5_1;
            }
        ],
        execute: function () {
            buildArgumentRegex = /"[^"]*"|\S+/g;
            buildpackEnvironmentNameRegex = /^"?(BP|ORYX)_[-._a-zA-Z0-9]+"?$/;
            azurecontainerapps = class azurecontainerapps {
                static runMain() {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.initializeHelpers();
                        try {
                            // Validate that the arguments provided can be used for one of the supported scenarios
                            this.validateSupportedScenarioArguments();
                            // Set up the Azure CLI to be used for this task
                            yield this.setupAzureCli();
                            // Set up the resources required to deploy a Container App
                            yield this.setupResources();
                            // If a Container Registry URL was provided, try to authenticate against it
                            if (!this.util.isNullOrEmpty(this.registryUrl)) {
                                yield this.authenticateContainerRegistryAsync();
                            }
                            // If an Azure Container Registry name was provided, try to authenticate against it
                            if (!this.util.isNullOrEmpty(this.acrName)) {
                                yield this.authenticateAzureContainerRegistryAsync();
                            }
                            // Set up property to determine if the internal registry should be used
                            this.useInternalRegistry = this.util.isNullOrEmpty(this.registryUrl);
                            // If the application source was provided, build a runnable application image from it
                            if (!this.useInternalRegistry && !this.util.isNullOrEmpty(this.appSourcePath)) {
                                yield this.buildAndPushImageAsync();
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
                            yield this.createOrUpdateContainerApp();
                            // If telemetry is enabled, log that the task completed successfully
                            this.telemetryHelper.setSuccessfulResult();
                        }
                        catch (err) {
                            this.toolHelper.setFailed(err.message);
                            this.telemetryHelper.setFailedResult(err.message);
                        }
                        finally {
                            // If telemetry is enabled, will log metadata for this task run
                            yield this.telemetryHelper.sendLogs();
                        }
                    });
                }
                /**
                 * Initializes the helpers used by this task.
                 * @param disableTelemetry - Whether or not to disable telemetry for this task.
                 */
                static initializeHelpers() {
                    // Set up Utility for managing miscellaneous calls
                    this.util = new Utility_4.Utility();
                    // Set up toolHelper for managing calls to the GitHub Actions toolkit
                    this.toolHelper = new GitHubActionsToolHelper_5.GitHubActionsToolHelper();
                    let disableTelemetry = this.toolHelper.getInput('disableTelemetry').toLowerCase() === 'true';
                    // Get buildId
                    this.buildId = this.toolHelper.getBuildId();
                    // Get buildNumber
                    this.buildNumber = this.toolHelper.getBuildNumber();
                    // Set up TelemetryHelper for managing telemetry calls
                    this.telemetryHelper = new TelemetryHelper_1.TelemetryHelper(disableTelemetry);
                    // Set up ContainerAppHelper for managing calls around the Container App
                    this.appHelper = new ContainerAppHelper_1.ContainerAppHelper(disableTelemetry);
                    // Set up ContainerRegistryHelper for managing calls around the Container Registry
                    this.registryHelper = new ContainerRegistryHelper_1.ContainerRegistryHelper();
                }
                /**
                 * Validates the arguments provided to the task for supported scenarios.
                 * @throws Error if a valid combination of the support scenario arguments is not provided.
                 */
                static validateSupportedScenarioArguments() {
                    // Get the path to the application source to build and run, if provided
                    this.appSourcePath = this.toolHelper.getInput('appSourcePath', false);
                    // Get the name of the ACR instance to push images to, if provided
                    this.acrName = this.toolHelper.getInput('acrName', false);
                    // Get the name of the RegistryUrl to push images to, if provided
                    this.registryUrl = this.toolHelper.getInput('registryUrl', false);
                    // Get the previously built image to deploy, if provided
                    this.imageToDeploy = this.toolHelper.getInput('imageToDeploy', false);
                    // Get the YAML configuration file, if provided
                    this.yamlConfigPath = this.toolHelper.getInput('yamlConfigPath', false);
                    // Get the name of the image to build if it was provided, or generate it from build variables
                    this.imageToBuild = this.toolHelper.getInput('imageToBuild', false);
                    // Get the user defined build arguments, if provided
                    this.buildArguments = this.toolHelper.getInput('buildArguments', false);
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
                    // Set up the build arguments to pass to the Dockerfile or builder
                    if (!this.util.isNullOrEmpty(this.buildArguments)) {
                        // Ensure that the build arguments are in the format 'key1=value1 key2=value2'
                        const buildArguments = this.buildArguments.match(buildArgumentRegex);
                        let invalidBuildArgumentsMessage = `The 'buildArguments' argument must be in the format 'key1=value1 key2=value2'.`;
                        const invalidBuildArguments = buildArguments.some(variable => {
                            if (!this.util.isNullOrEmpty(variable)) {
                                return variable.indexOf('=') === -1;
                            }
                            else {
                                return false;
                            }
                        });
                        if (invalidBuildArguments) {
                            this.toolHelper.writeError(invalidBuildArgumentsMessage);
                            throw Error(invalidBuildArgumentsMessage);
                        }
                    }
                }
                /**
                 * Sets up the Azure CLI to be used for this task by logging in to Azure with the provided service connection and
                 * setting the Azure CLI to install missing extensions.
                 */
                static setupAzureCli() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Set the Azure CLI to install missing extensions
                        yield this.util.installAzureCliExtension();
                    });
                }
                /**
                 * Sets up the resources required to deploy a Container App. This includes the following:
                 * - Getting or generating the Container App name
                 * - Getting or discovering the location to deploy resources to
                 * - Getting or creating the resource group
                 * - Getting or creating the Container App Environment
                 */
                static setupResources() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Get the Container App name if it was provided, or generate it from build variables
                        this.containerAppName = this.getContainerAppName();
                        // Get the location to deploy resources to, if provided, or use the default location
                        this.location = yield this.getLocation();
                        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
                        let resourceGroup = this.toolHelper.getInput('resourceGroup', false);
                        this.resourceGroup = yield this.getOrCreateResourceGroup(resourceGroup, this.containerAppName, this.location);
                        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
                        let containerAppEnvironmentResourceGroup = this.toolHelper.getInput('containerAppEnvironmentResourceGroup', false);
                        this.containerAppEnvironmentResourceGroup = yield this.getOrCreateResourceGroup(containerAppEnvironmentResourceGroup, this.containerAppName, this.location);
                        // Determine if the Container Appp currently exists
                        this.containerAppExists = yield this.appHelper.doesContainerAppExist(this.containerAppName, this.resourceGroup);
                        // If the Container App doesn't exist, get/create the Container App Environment to use for the Container App
                        if (!this.containerAppExists) {
                            this.containerAppEnvironment = yield this.getOrCreateContainerAppEnvironment(this.containerAppName, this.containerAppEnvironmentResourceGroup, this.location);
                        }
                    });
                }
                /**
                 * Gets the name of the Container App to use for the task. If the 'containerAppName' argument is not provided,
                 * then a default name will be generated in the form 'gh-action-app-<buildId>-<buildNumber>'.
                 * @returns The name of the Container App to use for the task.
                 */
                static getContainerAppName() {
                    let containerAppName = this.toolHelper.getInput('containerAppName', false);
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
                static getLocation() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Set deployment location, if provided
                        let location = this.toolHelper.getInput('location', false);
                        if (!this.util.isNullOrEmpty(location)) {
                            return location;
                        }
                        // If no location was provided, attempt to discover the location of the existing Container App Environment linked to the Container App
                        // or Container App Environment provided in the resource group or use the default location.
                        // Get the resource group if it was provided
                        let resourceGroup = this.toolHelper.getInput('resourceGroup', false);
                        if (!this.util.isNullOrEmpty(resourceGroup)) {
                            // Check if Container App exists in the resource group provided and get the location from the Container App Environment linked to it
                            let containerAppExists = yield this.appHelper.doesContainerAppExist(this.containerAppName, resourceGroup);
                            if (containerAppExists) {
                                // Get the name of the Container App Environment linked to the Container App
                                var environmentName = yield this.appHelper.getExistingContainerAppEnvironmentName(this.containerAppName, resourceGroup);
                                // Check if environment exists in the resource group provided and get the location
                                var containerAppEnvironmentExistsInResourceGroup = !this.util.isNullOrEmpty(environmentName) ? yield this.appHelper.doesContainerAppEnvironmentExist(environmentName, resourceGroup) : false;
                                if (containerAppEnvironmentExistsInResourceGroup) {
                                    // Get the location of the Container App Environment linked to the Container App
                                    location = yield this.appHelper.getExistingContainerAppEnvironmentLocation(environmentName, resourceGroup);
                                    return location;
                                }
                            }
                            // Get the Container App Environment name if it was provided
                            let containerAppEnvironment = this.toolHelper.getInput('containerAppEnvironment', false);
                            // Check if Container App Environment is provided and exits in the resource group provided and get the location
                            let containerAppEnvironmentExists = !this.util.isNullOrEmpty(containerAppEnvironment) ? yield this.appHelper.doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup) : false;
                            if (containerAppEnvironmentExists) {
                                location = yield this.appHelper.getExistingContainerAppEnvironmentLocation(containerAppEnvironment, resourceGroup);
                                return location;
                            }
                        }
                        // Get the default location if the Container App or Container App Environment was not found in the resource group provided.
                        location = yield this.appHelper.getDefaultContainerAppLocation();
                        return location;
                    });
                }
                /**
                 * Gets the name of the resource group to use for the task. If the 'resourceGroup' argument is not provided,
                 * then a default name will be generated in the form '<containerAppName>-rg'. If the generated resource group does
                 * not exist, it will be created.
                 * @param containerAppName - The name of the Container App to use for the task.
                 * @param location - The location to deploy resources to.
                 * @returns The name of the resource group to use for the task.
                 */
                static getOrCreateResourceGroup(resourceGroup, containerAppName, location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
                        if (this.util.isNullOrEmpty(resourceGroup)) {
                            resourceGroup = `${containerAppName}-rg`;
                            this.toolHelper.writeInfo(`Default resource group name: ${resourceGroup}`);
                            // Ensure that the resource group that the Container App will be created in exists
                            const resourceGroupExists = yield this.appHelper.doesResourceGroupExist(resourceGroup);
                            if (!resourceGroupExists) {
                                yield this.appHelper.createResourceGroup(resourceGroup, location);
                            }
                        }
                        return resourceGroup;
                    });
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
                static getOrCreateContainerAppEnvironment(containerAppName, resourceGroup, location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Get the Container App environment if it was provided
                        let containerAppEnvironment = this.toolHelper.getInput('containerAppEnvironment', false);
                        // See if we can reuse an existing Container App environment found in the resource group
                        if (this.util.isNullOrEmpty(containerAppEnvironment)) {
                            const existingContainerAppEnvironment = yield this.appHelper.getExistingContainerAppEnvironment(resourceGroup);
                            if (!this.util.isNullOrEmpty(existingContainerAppEnvironment)) {
                                this.toolHelper.writeInfo(`Existing Container App environment found in resource group: ${existingContainerAppEnvironment}`);
                                return existingContainerAppEnvironment;
                            }
                        }
                        // Generate the Container App environment name if it was not provided
                        if (this.util.isNullOrEmpty(containerAppEnvironment)) {
                            containerAppEnvironment = `${containerAppName}-env`;
                            this.toolHelper.writeInfo(`Default Container App environment name: ${containerAppEnvironment}`);
                        }
                        // Determine if the Container App environment currently exists and create one if it doesn't
                        const containerAppEnvironmentExists = yield this.appHelper.doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup);
                        if (!containerAppEnvironmentExists) {
                            yield this.appHelper.createContainerAppEnvironment(containerAppEnvironment, resourceGroup, location);
                        }
                        return containerAppEnvironment;
                    });
                }
                /**
                 * Authenticates calls to the provided Azure Container Registry.
                 */
                static authenticateAzureContainerRegistryAsync() {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.registryUsername = this.toolHelper.getInput('acrUsername', false);
                        this.registryPassword = this.toolHelper.getInput('acrPassword', false);
                        this.registryUrl = `${this.acrName}.azurecr.io`;
                        // Login to ACR if credentials were provided
                        if (!this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
                            this.toolHelper.writeInfo(`Logging in to ACR instance "${this.acrName}" with username and password credentials`);
                            yield this.registryHelper.loginContainerRegistryWithUsernamePassword(this.registryUrl, this.registryUsername, this.registryPassword);
                        }
                        else {
                            this.toolHelper.writeInfo(`No ACR credentials provided; attempting to log in to ACR instance "${this.acrName}" with access token`);
                            yield this.registryHelper.loginAcrWithAccessTokenAsync(this.acrName);
                        }
                    });
                }
                /**
                 * Authenticates calls to the provided Container Registry.
                 */
                static authenticateContainerRegistryAsync() {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.registryUsername = this.toolHelper.getInput('registryUsername', false);
                        this.registryPassword = this.toolHelper.getInput('registryPassword', false);
                        // Login to Container Registry if credentials were provided
                        if (!this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
                            this.toolHelper.writeInfo(`Logging in to Container Registry "${this.registryUrl}" with username and password credentials`);
                            yield this.registryHelper.loginContainerRegistryWithUsernamePassword(this.registryUrl, this.registryUsername, this.registryPassword);
                        }
                    });
                }
                /**
                 * Sets up the scenario where an existing image is used for the Container App.
                 */
                static setupExistingImageScenario() {
                    // If telemetry is enabled, log that the previously built image scenario was targeted for this task
                    this.telemetryHelper.setImageScenario();
                }
                /**
                 * Builds a runnable application image using a Dockerfile or the builder and pushes it to the Container Registry.
                 */
                static buildAndPushImageAsync() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Get the name of the image to build if it was provided, or generate it from build variables
                        this.imageToBuild = this.toolHelper.getInput('imageToBuild', false);
                        if (this.util.isNullOrEmpty(this.imageToBuild)) {
                            const imageRepository = this.toolHelper.getDefaultImageRepository();
                            // Constructs the image to build based on the provided registry URL, image repository,  build ID, and build number.
                            this.imageToBuild = `${this.registryUrl}/${imageRepository}:${this.buildId}.${this.buildNumber}`;
                            this.toolHelper.writeInfo(`Default image to build: ${this.imageToBuild}`);
                        }
                        // Get the name of the image to deploy if it was provided, or set it to the value of 'imageToBuild'
                        if (this.util.isNullOrEmpty(this.imageToDeploy)) {
                            this.imageToDeploy = this.imageToBuild;
                            this.toolHelper.writeInfo(`Default image to deploy: ${this.imageToDeploy}`);
                        }
                        // Get the build arguments to pass to the Dockerfile or builder
                        let buildArguments = [];
                        if (!this.util.isNullOrEmpty(this.buildArguments)) {
                            this.buildArguments.match(buildArgumentRegex).forEach((buildArg) => {
                                buildArguments.push(buildArg);
                            });
                        }
                        // Get Dockerfile to build, if provided, or check if one exists at the root of the provided application
                        let dockerfilePath = this.toolHelper.getInput('dockerfilePath', false);
                        if (this.util.isNullOrEmpty(dockerfilePath)) {
                            this.toolHelper.writeInfo(`No Dockerfile path provided; checking for Dockerfile at root of application source.`);
                            const rootDockerfilePath = path.join(this.appSourcePath, 'Dockerfile');
                            if (fs.existsSync(rootDockerfilePath)) {
                                this.toolHelper.writeInfo(`Dockerfile found at root of application source.`);
                                dockerfilePath = rootDockerfilePath;
                            }
                            else {
                                // No Dockerfile found or provided, build the image using the builder
                                yield this.buildImageFromBuilderAsync(this.appSourcePath, this.imageToBuild, buildArguments);
                            }
                        }
                        else {
                            dockerfilePath = path.join(this.appSourcePath, dockerfilePath);
                        }
                        if (!this.util.isNullOrEmpty(dockerfilePath)) {
                            // Build the image from the provided/discovered Dockerfile
                            yield this.buildImageFromDockerfile(this.appSourcePath, dockerfilePath, this.imageToBuild, buildArguments);
                        }
                        // Push the image to the Container Registry
                        yield this.registryHelper.pushImageToContainerRegistry(this.imageToBuild);
                    });
                }
                /**
                 * Builds a runnable application image using the builder.
                 * @param appSourcePath - The path to the application source code.
                 * @param imageToBuild - The name of the image to build.
                 * @param buildArguments - The build arguments to pass to the pack command via environment variables.
                 */
                static buildImageFromBuilderAsync(appSourcePath, imageToBuild, buildArguments) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (buildArguments.length > 0) {
                            buildArguments.forEach((buildArg) => {
                                const nameAndValue = buildArg.split('=');
                                const isNameValid = nameAndValue[0].match(buildpackEnvironmentNameRegex);
                                if (!isNameValid) {
                                    const invalidBuildArgumentsMessage = `Build environment variable name must consist of alphanumeric characters, numbers, '_', '.' or '-', start with 'BP_' or 'ORYX_'.`;
                                    this.toolHelper.writeError(invalidBuildArgumentsMessage);
                                    throw Error(invalidBuildArgumentsMessage);
                                }
                            });
                        }
                        // Install the pack CLI
                        yield this.appHelper.installPackCliAsync();
                        this.toolHelper.writeInfo(`Successfully installed the pack CLI.`);
                        // Enable experimental features for the pack CLI
                        yield this.appHelper.enablePackCliExperimentalFeaturesAsync();
                        this.toolHelper.writeInfo(`Successfully enabled experimental features for the pack CLI.`);
                        // Define the environment variables that should be propagated to the builder
                        let environmentVariables = [];
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
                        // Add user-specified build environment variables
                        if (buildArguments.length > 0) {
                            buildArguments.forEach((buildArg) => {
                                environmentVariables.push(buildArg);
                            });
                        }
                        this.toolHelper.writeInfo(`Building image "${imageToBuild}" using the Oryx++ Builder`);
                        // Set the Oryx++ Builder as the default builder locally
                        yield this.appHelper.setDefaultBuilder();
                        // Create a runnable application image
                        yield this.appHelper.createRunnableAppImage(imageToBuild, appSourcePath, environmentVariables, builderStack);
                        // If telemetry is enabled, log that the builder scenario was targeted for this task
                        this.telemetryHelper.setBuilderScenario();
                    });
                }
                /**
                 * Builds a runnable application image using a provided or discovered Dockerfile.
                 * @param appSourcePath - The path to the application source code.
                 * @param dockerfilePath - The path to the Dockerfile to build.
                 * @param imageToBuild - The name of the image to build.
                 * @param buildArguments - The build arguments to pass to the docker build command.
                 */
                static buildImageFromDockerfile(appSourcePath, dockerfilePath, imageToBuild, buildArguments) {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.toolHelper.writeInfo(`Building image "${imageToBuild}" using the provided Dockerfile`);
                        yield this.appHelper.createRunnableAppImageFromDockerfile(imageToBuild, appSourcePath, dockerfilePath, buildArguments);
                        // If telemetry is enabled, log that the Dockerfile scenario was targeted for this task
                        this.telemetryHelper.setDockerfileScenario();
                    });
                }
                /**
                 * Sets up the Container App properties that will be passed through to the Azure CLI when a YAML configuration
                 * file is not provided.
                 */
                static setupContainerAppProperties() {
                    this.commandLineArgs = [];
                    // Get the ingress inputs
                    this.ingress = this.toolHelper.getInput('ingress', false);
                    this.targetPort = this.toolHelper.getInput('targetPort', false);
                    // If both ingress and target port were not provided for an existing Container App, or if ingress is to be disabled,
                    // use the 'update' command, otherwise we should use the 'up' command that performs a PATCH operation on the ingress properties.
                    this.noIngressUpdate = this.containerAppExists &&
                        this.util.isNullOrEmpty(this.targetPort) &&
                        (this.util.isNullOrEmpty(this.ingress) || this.ingress == 'disabled');
                    // Pass the Container Registry credentials when creating a Container App or updating a Container App via the 'up' command
                    if (!this.util.isNullOrEmpty(this.registryUrl) && !this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword) &&
                        (!this.containerAppExists || (this.containerAppExists && !this.noIngressUpdate))) {
                        this.adminCredentialsProvided = true;
                        this.commandLineArgs.push(`--registry-server ${this.registryUrl}`, `--registry-username ${this.registryUsername}`, `--registry-password ${this.registryPassword}`);
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
                    const environmentVariables = this.toolHelper.getInput('environmentVariables', false);
                    const isCappUpdateCommandUsed = this.noIngressUpdate || (!this.noIngressUpdate && !this.adminCredentialsProvided);
                    // Add user-specified environment variables
                    if (!this.util.isNullOrEmpty(environmentVariables)) {
                        // The --replace-env-vars flag is only used for the 'update' command,
                        // otherwise --env-vars is used for 'create' and 'up'
                        if (isCappUpdateCommandUsed) {
                            this.commandLineArgs.push(`--replace-env-vars ${environmentVariables}`);
                        }
                        else {
                            this.commandLineArgs.push(`--env-vars ${environmentVariables}`);
                        }
                    }
                    // Ensure '-i' argument and '--source' argument are not both provided
                    if (!this.util.isNullOrEmpty(this.imageToDeploy)) {
                        this.commandLineArgs.push(`-i ${this.imageToDeploy}`);
                    }
                    else if (!this.util.isNullOrEmpty(this.appSourcePath) && this.useInternalRegistry) {
                        this.commandLineArgs.push(`--source ${this.appSourcePath}`);
                    }
                }
                /**
                 * Creates or updates the Container App.
                 */
                static createOrUpdateContainerApp() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!this.containerAppExists) {
                            if (!this.util.isNullOrEmpty(this.yamlConfigPath)) {
                                // Create the Container App from the YAML configuration file
                                yield this.appHelper.createContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath);
                            }
                            else {
                                // Create the Container App from command line arguments
                                yield this.appHelper.createContainerApp(this.containerAppName, this.resourceGroup, this.containerAppEnvironment, this.commandLineArgs);
                            }
                            return;
                        }
                        if (!this.util.isNullOrEmpty(this.yamlConfigPath)) {
                            // Update the Container App from the YAML configuration file
                            yield this.appHelper.updateContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath);
                            return;
                        }
                        if (this.noIngressUpdate) {
                            // Update the Container Registry details on the existing Container App, if provided as an input
                            if (!this.util.isNullOrEmpty(this.registryUrl) && !this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
                                yield this.appHelper.updateContainerAppRegistryDetails(this.containerAppName, this.resourceGroup, this.registryUrl, this.registryUsername, this.registryPassword);
                            }
                            // Update the Container App using the 'update' command
                            yield this.appHelper.updateContainerApp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
                        }
                        else if (this.adminCredentialsProvided && !this.noIngressUpdate) {
                            // Update the Container App with `up` command when admin credentials are provided and ingress is manually provided.
                            yield this.appHelper.updateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs, this.ingress, this.targetPort);
                        }
                        else {
                            // Update the Container App using the 'containerapp update' and 'ingress update' commands
                            yield this.appHelper.updateContainerApp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
                            yield this.appHelper.updateContainerAppIngress(this.containerAppName, this.resourceGroup, this.ingress, this.targetPort);
                        }
                        // Disable ingress on the existing Container App, if provided as an input
                        if (this.ingress == 'disabled') {
                            yield this.appHelper.disableContainerAppIngress(this.containerAppName, this.resourceGroup);
                        }
                    });
                }
            };
            exports_6("azurecontainerapps", azurecontainerapps);
            azurecontainerapps.runMain();
        }
    };
});
