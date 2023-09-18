"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ContainerAppHelper = void 0;
var core = require("@actions/core");
var exec = require("@actions/exec");
var io = require("@actions/io");
var path = require("path");
var os = require("os");
var CommandHelper_1 = require("./CommandHelper");
var Utility_1 = require("./Utility");
var util = require('util');
var cpExec = util.promisify(require('child_process').exec);
var ORYX_CLI_IMAGE = 'mcr.microsoft.com/oryx/cli:builder-debian-buster-20230208.1';
var ORYX_BUILDER_IMAGE = 'mcr.microsoft.com/oryx/builder:20230208.1';
var IS_WINDOWS_AGENT = os.platform() == 'win32';
var PACK_CMD = IS_WINDOWS_AGENT ? path.join(os.tmpdir(), 'pack') : 'pack';
var ContainerAppHelper = /** @class */ (function () {
    function ContainerAppHelper(disableTelemetry) {
        this.disableTelemetry = false;
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
    ContainerAppHelper.prototype.createContainerApp = function (containerAppName, resourceGroup, environment, imageToDeploy, optionalCmdArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var command_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to create Container App with name \"" + containerAppName + "\" in resource group \"" + resourceGroup + "\" based from image \"" + imageToDeploy + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command_1 = "az containerapp create -n " + containerAppName + " -g " + resourceGroup + " -i " + imageToDeploy + " --environment " + environment;
                        optionalCmdArgs.forEach(function (val) {
                            command_1 += " " + val;
                        });
                        return [4 /*yield*/, cpExec({ command: command_1 })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        core.error(err_1.message);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates an Azure Container App based from a YAML configuration file.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
     */
    ContainerAppHelper.prototype.createContainerAppFromYaml = function (containerAppName, resourceGroup, yamlConfigPath) {
        return __awaiter(this, void 0, void 0, function () {
            var command, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to create Container App with name \"" + containerAppName + "\" in resource group \"" + resourceGroup + "\" from provided YAML \"" + yamlConfigPath + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = "az containerapp create -n " + containerAppName + " -g " + resourceGroup + " --yaml " + yamlConfigPath;
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        core.error(err_2.message);
                        throw err_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates an existing Azure Container App based from an image that was previously built.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param imageToDeploy - the name of the runnable application image that the Container App will be based from
     * @param optionalCmdArgs - a set of optional command line arguments
     */
    ContainerAppHelper.prototype.updateContainerApp = function (containerAppName, resourceGroup, imageToDeploy, optionalCmdArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var command_2, pathToTool, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to update Container App with name \"" + containerAppName + "\" in resource group \"" + resourceGroup + "\" based from image \"" + imageToDeploy + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command_2 = "containerapp update -n " + containerAppName + " -g " + resourceGroup + " -i " + imageToDeploy;
                        optionalCmdArgs.forEach(function (val) {
                            command_2 += " " + val;
                        });
                        return [4 /*yield*/, io.which('az', true)];
                    case 2:
                        pathToTool = _a.sent();
                        new Utility_1.Utility().executeAndthrowIfError(pathToTool, command_2, "Unable to update Azure Container App via 'az containerapp update' command.");
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        core.error(err_3.message);
                        throw err_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates an existing Azure Container App using the 'az containerapp up' command.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param imageToDeploy - the name of the runnable application image that the Container App will be based from
     * @param optionalCmdArgs - a set of optional command line arguments
     * @param ingress - the ingress that the Container App will be exposed on
     * @param targetPort - the target port that the Container App will be exposed on
     */
    ContainerAppHelper.prototype.updateContainerAppWithUp = function (containerAppName, resourceGroup, imageToDeploy, optionalCmdArgs, ingress, targetPort) {
        return __awaiter(this, void 0, void 0, function () {
            var util, command_3, pathToTool, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to update Container App with name \"" + containerAppName + "\" in resource group \"" + resourceGroup + "\" based from image \"" + imageToDeploy + "\"");
                        util = new Utility_1.Utility();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command_3 = "containerapp up -n " + containerAppName + " -g " + resourceGroup + " -i " + imageToDeploy;
                        optionalCmdArgs.forEach(function (val) {
                            command_3 += " " + val;
                        });
                        if (!util.isNullOrEmpty(ingress)) {
                            command_3 += " --ingress " + ingress;
                        }
                        if (!util.isNullOrEmpty(targetPort)) {
                            command_3 += " --target-port " + targetPort;
                        }
                        return [4 /*yield*/, io.which('az', true)];
                    case 2:
                        pathToTool = _a.sent();
                        util.executeAndthrowIfError(pathToTool, command_3, "Unable to update Azure Container App via 'az containerapp up' command.");
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _a.sent();
                        core.error(err_4.message);
                        throw err_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates an existing Azure Container App based from a YAML configuration file.
     * @param containerAppName - the name of the existing Container App
     * @param resourceGroup - the resource group that the existing Container App is found in
     * @param yamlConfigPath - the path to the YAML configuration file that the Container App properties will be based from
     */
    ContainerAppHelper.prototype.updateContainerAppFromYaml = function (containerAppName, resourceGroup, yamlConfigPath) {
        return __awaiter(this, void 0, void 0, function () {
            var command, pathToTool, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to update Container App with name \"" + containerAppName + "\" in resource group \"" + resourceGroup + "\" from provided YAML \"" + yamlConfigPath + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = "containerapp update -n " + containerAppName + " -g " + resourceGroup + " --yaml " + yamlConfigPath;
                        return [4 /*yield*/, io.which('az', true)];
                    case 2:
                        pathToTool = _a.sent();
                        new Utility_1.Utility().executeAndthrowIfError(pathToTool, command, "Unable to update Azure Container App from YAML configuration file via 'az containerapp update' command.");
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        core.error(err_5.message);
                        throw err_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines if the provided Container App exists in the provided resource group.
     * @param containerAppName - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @returns true if the Container App exists, false otherwise
     */
    ContainerAppHelper.prototype.doesContainerAppExist = function (containerAppName, resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, stdout, stderr, err_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Attempting to determine if Container App with name \"" + containerAppName + "\" exists in resource group \"" + resourceGroup + "\"");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        command = "az containerapp show -n " + containerAppName + " -g " + resourceGroup + " -o none";
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        return [2 /*return*/, !stderr];
                    case 3:
                        err_6 = _b.sent();
                        core.warning(err_6.message);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines if the provided Container App Environment exists in the provided resource group.
     * @param containerAppEnvironment - the name of the Container App Environment
     * @param resourceGroup - the resource group that the Container App Environment is found in
     * @returns true if the Container App Environment exists, false otherwise
     */
    ContainerAppHelper.prototype.doesContainerAppEnvironmentExist = function (containerAppEnvironment, resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, stdout, stderr, err_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Attempting to determine if Container App Environment with name \"" + containerAppEnvironment + "\" exists in resource group \"" + resourceGroup + "\"");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        command = "az containerapp env show -n " + containerAppEnvironment + " -g " + resourceGroup + " -o none";
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        return [2 /*return*/, !stderr];
                    case 3:
                        err_7 = _b.sent();
                        core.warning(err_7.message);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines if the provided resource group exists.
     * @param resourceGroup - the name of the resource group
     * @returns true if the resource group exists, false otherwise
     */
    ContainerAppHelper.prototype.doesResourceGroupExist = function (resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, stdout, stderr, err_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Attempting to determine if resource group \"" + resourceGroup + "\" exists");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        command = "az group show -n " + resourceGroup + " -o none";
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        return [2 /*return*/, !stderr];
                    case 3:
                        err_8 = _b.sent();
                        core.warning(err_8.message);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the default location for the Container App provider.
     * @returns the default location if found, otherwise 'eastus2'
     */
    ContainerAppHelper.prototype.getDefaultContainerAppLocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, stdout, stderr, err_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Attempting to get the default location for the Container App service for the subscription.");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        command = "az provider show -n Microsoft.App --query \"resourceTypes[?resourceType=='containerApps'].locations[] | [0]\"";
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        // If successful, strip out double quotes, spaces and parentheses from the first location returned
                        return [2 /*return*/, !stderr ? stdout.toLowerCase().replace(/["() ]/g, "") : "eastus2"];
                    case 3:
                        err_9 = _b.sent();
                        core.warning(err_9.message);
                        return [2 /*return*/, "eastus2"];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new resource group in the provided location.
     * @param name - the name of the resource group to create
     * @param location - the location to create the resource group in
     */
    ContainerAppHelper.prototype.createResourceGroup = function (name, location) {
        return __awaiter(this, void 0, void 0, function () {
            var command, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to create resource group \"" + name + "\" in location \"" + location + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = "az group create -n " + name + " -l " + location;
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_10 = _a.sent();
                        core.error(err_10.message);
                        throw err_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the name of an existing Container App Environment in the provided resource group.
     * @param resourceGroup - the resource group to check for an existing Container App Environment
     * @returns the name of the existing Container App Environment, null if none exists
     */
    ContainerAppHelper.prototype.getExistingContainerAppEnvironment = function (resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, stdout, stderr, err_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Attempting to get the existing Container App Environment in resource group \"" + resourceGroup + "\"");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        command = "az containerapp env list -g " + resourceGroup + " --query [0].name\"";
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        return [2 /*return*/, !stderr ? stdout : null];
                    case 3:
                        err_11 = _b.sent();
                        core.warning(err_11.message);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new Azure Container App Environment in the provided resource group.
     * @param name - the name of the Container App Environment
     * @param resourceGroup - the resource group that the Container App Environment will be created in
     * @param location - the location that the Container App Environment will be created in
     */
    ContainerAppHelper.prototype.createContainerAppEnvironment = function (name, resourceGroup, location) {
        return __awaiter(this, void 0, void 0, function () {
            var util, command, err_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        util = new Utility_1.Utility();
                        core.debug("Attempting to create Container App Environment with name \"" + name + "\" in resource group \"" + resourceGroup + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = "az containerapp env create -n " + name + " -g " + resourceGroup;
                        if (!util.isNullOrEmpty(location)) {
                            command += " -l " + location;
                        }
                        return [4 /*yield*/, cpExec("" + command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_12 = _a.sent();
                        core.error(err_12.message);
                        throw err_12;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disables ingress on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     */
    ContainerAppHelper.prototype.disableContainerAppIngress = function (name, resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var command, _a, _b, err_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        core.debug("Attempting to disable ingress for Container App with name \"" + name + "\" in resource group \"" + resourceGroup + "\"");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        command = "containerapp ingress disable -n " + name + " -g " + resourceGroup;
                        _b = (_a = new Utility_1.Utility()).executeAndthrowIfError;
                        return [4 /*yield*/, io.which('az', true)];
                    case 2:
                        _b.apply(_a, [_c.sent(), command, "Unable to disable ingress for Container App via 'az containerapp ingress disable' command."]);
                        return [3 /*break*/, 4];
                    case 3:
                        err_13 = _c.sent();
                        core.error(err_13.message);
                        throw err_13;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the ACR details on an existing Container App.
     * @param name - the name of the Container App
     * @param resourceGroup - the resource group that the Container App is found in
     * @param acrName - the name of the Azure Container Registry (without the .azurecr.io suffix)
     * @param acrUsername - the username used to authenticate with the Azure Container Registry
     * @param acrPassword - the password used to authenticate with the Azure Container Registry
     */
    ContainerAppHelper.prototype.updateContainerAppRegistryDetails = function (name, resourceGroup, acrName, acrUsername, acrPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var command, pathToTool, err_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to set the ACR details for Container App with name \"" + name + "\" in resource group \"" + resourceGroup + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = "containerapp registry set -n " + name + " -g " + resourceGroup + " --server " + acrName + ".azurecr.io --username " + acrUsername + " --password " + acrPassword;
                        return [4 /*yield*/, io.which('az', true)];
                    case 2:
                        pathToTool = _a.sent();
                        new Utility_1.Utility().executeAndthrowIfError(pathToTool, command, "Unable to set the ACR details for Container App via 'az containerapp registry set' command.");
                        return [3 /*break*/, 4];
                    case 3:
                        err_14 = _a.sent();
                        core.error(err_14.message);
                        throw err_14;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Using the Oryx++ Builder, creates a runnable application image from the provided application source.
     * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
     * @param appSourcePath - the path to the application source on the machine
     * @param runtimeStack - the runtime stack to use in the image layer that runs the application
     */
    ContainerAppHelper.prototype.createRunnableAppImage = function (imageToDeploy, appSourcePath, runtimeStack) {
        core.debug("Attempting to create a runnable application image using the Oryx++ Builder with image name \"" + imageToDeploy + "\"");
        try {
            var telemetryArg = "--env \"CALLER_ID=azure-pipelines-rc-v1\"";
            if (this.disableTelemetry) {
                telemetryArg = "--env \"ORYX_DISABLE_TELEMETRY=true\"";
            }
            new Utility_1.Utility().executeAndthrowIfError("" + PACK_CMD, "build " + imageToDeploy + " --path " + appSourcePath + " --builder " + ORYX_BUILDER_IMAGE + " --run-image mcr.microsoft.com/oryx/" + runtimeStack + " " + telemetryArg, "Unable to create runnable application image using the Oryx++ Builder with image name \"" + imageToDeploy + "\".");
        }
        catch (err) {
            core.error(err.message);
            throw err;
        }
    };
    /**
     * Using a Dockerfile that was provided or found at the root of the application source,
     * creates a runable application image.
     * @param imageToDeploy - the name of the runnable application image that is created and can be later deployed
     * @param appSourcePath - the path to the application source on the machine
     * @param dockerfilePath - the path to the Dockerfile to build and tag with the provided image name
     */
    ContainerAppHelper.prototype.createRunnableAppImageFromDockerfile = function (imageToDeploy, appSourcePath, dockerfilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var dockerTool, err_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug("Attempting to create a runnable application image from the provided/found Dockerfile \"" + dockerfilePath + "\" with image name \"" + imageToDeploy + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, io.which("docker", true)];
                    case 2:
                        dockerTool = _a.sent();
                        return [4 /*yield*/, exec.exec(dockerTool, ['build', '--file', "" + dockerfilePath, "" + appSourcePath, '--tag', "" + imageToDeploy])];
                    case 3:
                        _a.sent();
                        core.info("Successfully created runnable application image from the provided/found Dockerfile \"" + dockerfilePath + "\" with image name \"" + imageToDeploy + "\"");
                        return [3 /*break*/, 5];
                    case 4:
                        err_15 = _a.sent();
                        core.error(err_15.message);
                        throw err_15;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines the runtime stack to use for the runnable application image.
     * @param appSourcePath - the path to the application source on the machine
     * @returns a string representing the runtime stack that can be used for the Oryx MCR runtime images
     */
    ContainerAppHelper.prototype.determineRuntimeStackAsync = function (appSourcePath) {
        return __awaiter(this, void 0, void 0, function () {
            var dockerTool, dockerCommand, oryxRuntimeTxtPath, command, runtimeStack, err_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug('Attempting to determine the runtime stack needed for the provided application source');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, io.which("docker", true)];
                    case 2:
                        dockerTool = _a.sent();
                        dockerCommand = "run --rm -v " + appSourcePath + ":/app " + ORYX_CLI_IMAGE + " /bin/bash -c \"oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt\"";
                        exec.exec('docker', ['run', '--rm', '-v', appSourcePath + ":/app", "" + ORYX_CLI_IMAGE, '/bin/bash', '-c', "\"oryx dockerfile /app | head -n 1 | sed 's/ARG RUNTIME=//' >> /app/oryx-runtime.txt\""]);
                        oryxRuntimeTxtPath = path.join(appSourcePath, 'oryx-runtime.txt');
                        command = "head -n 1 " + oryxRuntimeTxtPath;
                        if (IS_WINDOWS_AGENT) {
                            command = "Get-Content -Path " + oryxRuntimeTxtPath + " -Head 1";
                        }
                        return [4 /*yield*/, new CommandHelper_1.CommandHelper().execCommandAsync(command)];
                    case 3:
                        runtimeStack = _a.sent();
                        // Delete the temp file
                        command = "rm " + oryxRuntimeTxtPath;
                        if (IS_WINDOWS_AGENT) {
                            command = "Remove-Item -Path " + oryxRuntimeTxtPath;
                        }
                        return [4 /*yield*/, new CommandHelper_1.CommandHelper().execCommandAsync(command)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, runtimeStack];
                    case 5:
                        err_16 = _a.sent();
                        core.error(err_16.message);
                        throw err_16;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the default builder on the machine to the Oryx++ Builder to prevent an exception from being thrown due
     * to no default builder set.
     */
    ContainerAppHelper.prototype.setDefaultBuilder = function () {
        core.debug('Setting the Oryx++ Builder as the default builder via the pack CLI');
        try {
            new Utility_1.Utility().executeAndthrowIfError("" + PACK_CMD, "config default-builder " + ORYX_BUILDER_IMAGE, "Unable to set the Oryx++ Builder as the default builder via the pack CLI.");
        }
        catch (err) {
            core.error(err.message);
            throw err;
        }
    };
    /**
     * Installs the pack CLI that will be used to build a runnable application image.
     * For more information about the pack CLI can be found here: https://buildpacks.io/docs/tools/pack/
     */
    ContainerAppHelper.prototype.installPackCliAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var command, packZipDownloadUri, packZipDownloadFilePath, tgzSuffix, err_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        core.debug('Attempting to install the pack CLI');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = '';
                        if (IS_WINDOWS_AGENT) {
                            packZipDownloadUri = 'https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-windows.zip';
                            packZipDownloadFilePath = path.join(PACK_CMD, 'pack-windows.zip');
                            command = "New-Item -ItemType Directory -Path " + PACK_CMD + " -Force | Out-Null;" +
                                ("Invoke-WebRequest -Uri " + packZipDownloadUri + " -OutFile " + packZipDownloadFilePath + "; ") +
                                ("Expand-Archive -LiteralPath " + packZipDownloadFilePath + " -DestinationPath " + PACK_CMD + "; ") +
                                ("Remove-Item -Path " + packZipDownloadFilePath);
                        }
                        else {
                            tgzSuffix = os.platform() == 'darwin' ? 'macos' : 'linux';
                            command = "(curl -sSL \"https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-" + tgzSuffix + ".tgz\" | " +
                                'tar -C /usr/local/bin/ --no-same-owner -xzv pack)';
                        }
                        return [4 /*yield*/, new CommandHelper_1.CommandHelper().execCommandAsync(command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_17 = _a.sent();
                        core.error("Unable to install the pack CLI.");
                        throw err_17;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ContainerAppHelper;
}());
exports.ContainerAppHelper = ContainerAppHelper;
