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
exports.azurecontainerapps = void 0;
var core = require("@actions/core");
var fs = require("fs");
var path = require("path");
//import { AzureAuthenticationHelper } from './src/AzureAuthenticationHelper';
var ContainerAppHelper_1 = require("./src/ContainerAppHelper");
var ContainerRegistryHelper_1 = require("./src/ContainerRegistryHelper");
var TelemetryHelper_1 = require("./src/TelemetryHelper");
var Utility_1 = require("./src/Utility");
var util = new Utility_1.Utility();
var azurecontainerapps = /** @class */ (function () {
    function azurecontainerapps() {
    }
    azurecontainerapps.runMain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var disableTelemetry, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        disableTelemetry = core.getInput('disableTelemetry').toLowerCase() === 'true';
                        this.initializeHelpers(disableTelemetry);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        // Get the current working directory
                        //const cwd: string = core.getInput('cwd');
                        //io.mkdirP(cwd);
                        //exec.exec(`cd ${cwd}`);
                        // Validate that the arguments provided can be used for one of the supported scenarios
                        this.validateSupportedScenarioArguments();
                        // Set up the Azure CLI to be used for this task
                        this.setupAzureCli();
                        // Set up the resources required to deploy a Container App
                        this.setupResources();
                        if (!!util.isNullOrEmpty(this.acrName)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.authenticateAzureContainerRegistryAsync()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!!util.isNullOrEmpty(this.appSourcePath)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.buildAndPushImageAsync()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        // If no application source was provided, set up the scenario for deploying an existing image
                        if (util.isNullOrEmpty(this.appSourcePath)) {
                            this.setupExistingImageScenario();
                        }
                        // If no YAML configuration file was provided, set up the Container App properties
                        if (util.isNullOrEmpty(this.yamlConfigPath)) {
                            this.setupContainerAppProperties();
                        }
                        // Create/update the Container App
                        this.createOrUpdateContainerApp();
                        // If telemetry is enabled, log that the task completed successfully
                        this.telemetryHelper.setSuccessfulResult();
                        return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        core.setFailed(err_1.message);
                        this.telemetryHelper.setFailedResult(err_1.message);
                        return [3 /*break*/, 8];
                    case 7:
                        // Logout of Azure if logged in during this task session
                        //  this.authHelper.logoutAzure();
                        // If telemetry is enabled, will log metadata for this task run
                        this.telemetryHelper.sendLogs();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initializes the helpers used by this task.
     * @param disableTelemetry - Whether or not to disable telemetry for this task.
     */
    azurecontainerapps.initializeHelpers = function (disableTelemetry) {
        // Set up TelemetryHelper for managing telemetry calls
        this.telemetryHelper = new TelemetryHelper_1.TelemetryHelper(disableTelemetry);
        // Set up AzureAuthenticationHelper for managing logging in and out of Azure CLI using provided service connection
        // this.authHelper = new AzureAuthenticationHelper();
        // Set up ContainerAppHelper for managing calls around the Container App
        this.appHelper = new ContainerAppHelper_1.ContainerAppHelper(disableTelemetry);
        // Set up ContainerRegistryHelper for managing calls around ACR
        this.registryHelper = new ContainerRegistryHelper_1.ContainerRegistryHelper();
    };
    /**
     * Validates the arguments provided to the task for supported scenarios.
     * @throws Error if a valid combination of the support scenario arguments is not provided.
     */
    azurecontainerapps.validateSupportedScenarioArguments = function () {
        // Get the path to the application source to build and run, if provided
        this.appSourcePath = core.getInput('appSourcePath', { required: false });
        // Get the name of the ACR instance to push images to, if provided
        this.acrName = core.getInput('acrName', { required: false });
        // Get the previously built image to deploy, if provided
        this.imageToDeploy = core.getInput('imageToDeploy', { required: false });
        // Get the YAML configuration file, if provided
        this.yamlConfigPath = core.getInput('yamlConfigPath', { required: false });
        // Ensure that acrName is also provided if appSourcePath is provided
        if (!util.isNullOrEmpty(this.appSourcePath) && util.isNullOrEmpty(this.acrName)) {
            core.error("The 'acrName' argument must be provided when the 'appSourcePath' argument is provided.");
            throw Error("The 'acrName' argument must be provided when the 'appSourcePath' argument is provided.");
        }
        // Ensure that one of appSourcePath, imageToDeploy, or yamlConfigPath is provided
        if (util.isNullOrEmpty(this.appSourcePath) && util.isNullOrEmpty(this.imageToDeploy) && util.isNullOrEmpty(this.yamlConfigPath)) {
            core.error("One of the following arguments must be provided: 'appSourcePath', 'imageToDeploy', or 'yamlConfigPath'.");
        }
    };
    /**
     * Sets up the Azure CLI to be used for this task by logging in to Azure with the provided service connection and
     * setting the Azure CLI to dynamically install missing extensions.
     */
    azurecontainerapps.setupAzureCli = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Log in to Azure with the service connection provided
                    //  const connectedService: string = tl.getInput('connectedServiceNameARM', true);
                    //  this.authHelper.loginAzureRM(connectedService);
                    // Set the Azure CLI to dynamically install missing extensions
                    return [4 /*yield*/, util.setAzureCliDynamicInstall()];
                    case 1:
                        // Log in to Azure with the service connection provided
                        //  const connectedService: string = tl.getInput('connectedServiceNameARM', true);
                        //  this.authHelper.loginAzureRM(connectedService);
                        // Set the Azure CLI to dynamically install missing extensions
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets up the resources required to deploy a Container App. This includes the following:
     * - Getting or generating the Container App name
     * - Getting or discovering the location to deploy resources to
     * - Getting or creating the resource group
     * - Getting or creating the Container App Environment
     */
    azurecontainerapps.setupResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Get the Container App name if it was provided, or generate it from build variables
                        this.containerAppName = this.getContainerAppName();
                        // Get the location to deploy resources to, if provided, or use the default location
                        _a = this;
                        return [4 /*yield*/, this.getLocation()];
                    case 1:
                        // Get the location to deploy resources to, if provided, or use the default location
                        _a.location = _e.sent();
                        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
                        _b = this;
                        return [4 /*yield*/, this.getOrCreateResourceGroup(this.containerAppName, this.location)];
                    case 2:
                        // Get the resource group to deploy to if it was provided, or generate it from the Container App name
                        _b.resourceGroup = _e.sent();
                        // Determine if the Container App currently exists
                        _c = this;
                        return [4 /*yield*/, this.appHelper.doesContainerAppExist(this.containerAppName, this.resourceGroup)];
                    case 3:
                        // Determine if the Container App currently exists
                        _c.containerAppExists = _e.sent();
                        if (!!this.containerAppExists) return [3 /*break*/, 5];
                        _d = this;
                        return [4 /*yield*/, this.getOrCreateContainerAppEnvironment(this.containerAppName, this.resourceGroup, this.location)];
                    case 4:
                        _d.containerAppEnvironment = _e.sent();
                        _e.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the name of the Container App to use for the task. If the 'containerAppName' argument is not provided,
     * then a default name will be generated in the form 'ado-task-app-<buildId>-<buildNumber>'.
     * @returns The name of the Container App to use for the task.
     */
    azurecontainerapps.getContainerAppName = function () {
        var containerAppName = core.getInput('containerAppName', { required: false });
        if (util.isNullOrEmpty(containerAppName)) {
            containerAppName = "app-" + this.buildId + "-" + this.buildNumber;
            // Replace all '.' characters with '-' characters in the Container App name
            containerAppName = containerAppName.replace(/\./gi, "-");
            console.log("Default Container App name: " + containerAppName);
        }
        return containerAppName;
    };
    /**
     * Gets the location to deploy resources to. If the 'location' argument is not provided, then the default location
     * for the Container App service will be used.
     * @returns The location to deploy resources to.
     */
    azurecontainerapps.getLocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var location;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        location = core.getInput('location', { required: false });
                        if (!util.isNullOrEmpty(location)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.appHelper.getDefaultContainerAppLocation()];
                    case 1:
                        location = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, location];
                }
            });
        });
    };
    /**
     * Gets the name of the resource group to use for the task. If the 'resourceGroup' argument is not provided,
     * then a default name will be generated in the form '<containerAppName>-rg'. If the generated resource group does
     * not exist, it will be created.
     * @param containerAppName - The name of the Container App to use for the task.
     * @param location - The location to deploy resources to.
     * @returns The name of the resource group to use for the task.
     */
    azurecontainerapps.getOrCreateResourceGroup = function (containerAppName, location) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceGroup, resourceGroupExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resourceGroup = core.getInput('resourceGroup', { required: false });
                        if (!util.isNullOrEmpty(resourceGroup)) return [3 /*break*/, 3];
                        resourceGroup = containerAppName + "-rg";
                        console.log("Default resource group name: " + resourceGroup);
                        return [4 /*yield*/, this.appHelper.doesResourceGroupExist(resourceGroup)];
                    case 1:
                        resourceGroupExists = _a.sent();
                        if (!!resourceGroupExists) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.appHelper.createResourceGroup(resourceGroup, location)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, resourceGroup];
                }
            });
        });
    };
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
    azurecontainerapps.getOrCreateContainerAppEnvironment = function (containerAppName, resourceGroup, location) {
        return __awaiter(this, void 0, void 0, function () {
            var containerAppEnvironment, existingContainerAppEnvironment, containerAppEnvironmentExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containerAppEnvironment = core.getInput('containerAppEnvironment', { required: false });
                        if (!util.isNullOrEmpty(containerAppEnvironment)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.appHelper.getExistingContainerAppEnvironment(resourceGroup)];
                    case 1:
                        existingContainerAppEnvironment = _a.sent();
                        if (!util.isNullOrEmpty(existingContainerAppEnvironment)) {
                            console.log("Existing Container App environment found in resource group: " + existingContainerAppEnvironment);
                            return [2 /*return*/, existingContainerAppEnvironment];
                        }
                        _a.label = 2;
                    case 2:
                        // Generate the Container App environment name if it was not provided
                        if (util.isNullOrEmpty(containerAppEnvironment)) {
                            containerAppEnvironment = containerAppName + "-env";
                            console.log("Default Container App environment name: " + containerAppEnvironment);
                        }
                        return [4 /*yield*/, this.appHelper.doesContainerAppEnvironmentExist(containerAppEnvironment, resourceGroup)];
                    case 3:
                        containerAppEnvironmentExists = _a.sent();
                        if (!containerAppEnvironmentExists) {
                            this.appHelper.createContainerAppEnvironment(containerAppEnvironment, resourceGroup, location);
                        }
                        return [2 /*return*/, containerAppEnvironment];
                }
            });
        });
    };
    /**
     * Authenticates calls to the provided Azure Container Registry.
     */
    azurecontainerapps.authenticateAzureContainerRegistryAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.acrUsername = core.getInput('acrUsername', { required: false });
                        this.acrPassword = core.getInput('acrPassword', { required: false });
                        if (!(!util.isNullOrEmpty(this.acrUsername) && !util.isNullOrEmpty(this.acrPassword))) return [3 /*break*/, 1];
                        console.log("Logging in to ACR instance \"" + this.acrName + "\" with username and password credentials");
                        this.registryHelper.loginAcrWithUsernamePassword(this.acrName, this.acrUsername, this.acrPassword);
                        return [3 /*break*/, 3];
                    case 1:
                        console.log("No ACR credentials provided; attempting to log in to ACR instance \"" + this.acrName + "\" with access token");
                        return [4 /*yield*/, this.registryHelper.loginAcrWithAccessTokenAsync(this.acrName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets up the scenario where an existing image is used for the Container App.
     */
    azurecontainerapps.setupExistingImageScenario = function () {
        // If telemetry is enabled, log that the previously built image scenario was targeted for this task
        this.telemetryHelper.setImageScenario();
    };
    /**
     * Builds a runnable application image using a Dockerfile or the builder and pushes it to ACR.
     */
    azurecontainerapps.buildAndPushImageAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dockerfilePath, rootDockerfilePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Get the name of the image to build if it was provided, or generate it from build variables
                        this.imageToBuild = core.getInput('imageToBuild', { required: false });
                        if (util.isNullOrEmpty(this.imageToBuild)) {
                            this.imageToBuild = this.acrName + ".azurecr.io/ado-task/container-app:" + this.buildId + "." + this.buildNumber;
                            console.log("Default image to build: " + this.imageToBuild);
                        }
                        // Get the name of the image to deploy if it was provided, or set it to the value of 'imageToBuild'
                        if (util.isNullOrEmpty(this.imageToDeploy)) {
                            this.imageToDeploy = this.imageToBuild;
                            console.log("Default image to deploy: " + this.imageToDeploy);
                        }
                        dockerfilePath = core.getInput('dockerfilePath', { required: false });
                        if (!util.isNullOrEmpty(dockerfilePath)) return [3 /*break*/, 4];
                        console.log("No Dockerfile path provided; checking for Dockerfile at root of application source.");
                        rootDockerfilePath = path.join(this.appSourcePath, 'Dockerfile');
                        if (!fs.existsSync(rootDockerfilePath)) return [3 /*break*/, 1];
                        console.log("Dockerfile found at root of application source.");
                        dockerfilePath = rootDockerfilePath;
                        return [3 /*break*/, 3];
                    case 1: 
                    // No Dockerfile found or provided, build the image using the builder
                    return [4 /*yield*/, this.buildImageFromBuilderAsync(this.appSourcePath, this.imageToBuild)];
                    case 2:
                        // No Dockerfile found or provided, build the image using the builder
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        dockerfilePath = path.join(this.appSourcePath, dockerfilePath);
                        _a.label = 5;
                    case 5:
                        if (!!util.isNullOrEmpty(dockerfilePath)) return [3 /*break*/, 7];
                        // Build the image from the provided/discovered Dockerfile
                        return [4 /*yield*/, this.builderImageFromDockerfile(this.appSourcePath, dockerfilePath, this.imageToBuild)];
                    case 6:
                        // Build the image from the provided/discovered Dockerfile
                        _a.sent();
                        _a.label = 7;
                    case 7: 
                    // Push the image to ACR
                    return [4 /*yield*/, this.registryHelper.pushImageToAcr(this.imageToBuild)];
                    case 8:
                        // Push the image to ACR
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Builds a runnable application image using the builder.
     * @param appSourcePath - The path to the application source code.
     * @param imageToBuild - The name of the image to build.
     */
    azurecontainerapps.buildImageFromBuilderAsync = function (appSourcePath, imageToBuild) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // Install the pack CLI
                    return [4 /*yield*/, this.appHelper.installPackCliAsync()];
                    case 1:
                        // Install the pack CLI
                        _b.sent();
                        // Get the runtime stack if provided, or determine it using Oryx
                        this.runtimeStack = core.getInput('runtimeStack', { required: false });
                        if (!util.isNullOrEmpty(this.runtimeStack)) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.appHelper.determineRuntimeStackAsync(appSourcePath)];
                    case 2:
                        _a.runtimeStack = _b.sent();
                        console.log("Runtime stack determined to be: " + this.runtimeStack);
                        _b.label = 3;
                    case 3:
                        console.log("Building image \"" + imageToBuild + "\" using the Oryx++ Builder");
                        // Set the Oryx++ Builder as the default builder locally
                        this.appHelper.setDefaultBuilder();
                        // Create a runnable application image
                        this.appHelper.createRunnableAppImage(imageToBuild, appSourcePath, this.runtimeStack);
                        // If telemetry is enabled, log that the builder scenario was targeted for this task
                        this.telemetryHelper.setBuilderScenario();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Builds a runnable application image using a provided or discovered Dockerfile.
     * @param appSourcePath - The path to the application source code.
     * @param dockerfilePath - The path to the Dockerfile to build.
     * @param imageToBuild - The name of the image to build.
     */
    azurecontainerapps.builderImageFromDockerfile = function (appSourcePath, dockerfilePath, imageToBuild) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Building image \"" + imageToBuild + "\" using the provided Dockerfile");
                        return [4 /*yield*/, this.appHelper.createRunnableAppImageFromDockerfile(imageToBuild, appSourcePath, dockerfilePath)];
                    case 1:
                        _a.sent();
                        // If telemetry is enabled, log that the Dockerfile scenario was targeted for this task
                        this.telemetryHelper.setDockerfileScenario();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets up the Container App properties that will be passed through to the Azure CLI when a YAML configuration
     * file is not provided.
     */
    azurecontainerapps.setupContainerAppProperties = function () {
        this.commandLineArgs = [];
        // Get the ingress inputs
        this.ingress = core.getInput('ingress', { required: false });
        this.targetPort = core.getInput('targetPort', { required: false });
        // If both ingress and target port were not provided for an existing Container App, or if ingress is to be disabled,
        // use the 'update' command, otherwise we should use the 'up' command that performs a PATCH operation on the ingress properties.
        this.shouldUseUpdateCommand = this.containerAppExists &&
            util.isNullOrEmpty(this.targetPort) &&
            (util.isNullOrEmpty(this.ingress) || this.ingress == 'disabled');
        // Pass the ACR credentials when creating a Container App or updating a Container App via the 'up' command
        if (!util.isNullOrEmpty(this.acrName) && !util.isNullOrEmpty(this.acrUsername) && !util.isNullOrEmpty(this.acrPassword) &&
            (!this.containerAppExists || (this.containerAppExists && !this.shouldUseUpdateCommand))) {
            this.commandLineArgs.push("--registry-server " + this.acrName + ".azurecr.io", "--registry-username " + this.acrUsername, "--registry-password " + this.acrPassword);
        }
        // Determine default values only for the 'create' scenario to avoid overriding existing values for the 'update' scenario
        if (!this.containerAppExists) {
            this.ingressEnabled = true;
            // Set the ingress value to 'external' if it was not provided
            if (util.isNullOrEmpty(this.ingress)) {
                this.ingress = 'external';
                console.log("Default ingress value: " + this.ingress);
            }
            // Set the value of ingressEnabled to 'false' if ingress was provided as 'disabled'
            if (this.ingress == 'disabled') {
                this.ingressEnabled = false;
                console.log("Ingress is disabled for this Container App.");
            }
            // Handle setup for ingress values when enabled
            if (this.ingressEnabled) {
                // Get the target port if provided, or determine it based on the application type
                this.targetPort = core.getInput('targetPort', { required: false });
                if (util.isNullOrEmpty(this.targetPort)) {
                    if (!util.isNullOrEmpty(this.runtimeStack) && this.runtimeStack.startsWith('python:')) {
                        this.targetPort = '80';
                    }
                    else {
                        this.targetPort = '8080';
                    }
                    console.log("Default target port: " + this.targetPort);
                }
                // Set the target port to 80 if it was not provided or determined
                if (util.isNullOrEmpty(this.targetPort)) {
                    this.targetPort = '80';
                    console.log("Default target port: " + this.targetPort);
                }
                // Add the ingress value and target port to the optional arguments array
                // Note: this step should be skipped if we're updating an existing Container App (ingress is enabled via a separate command)
                this.commandLineArgs.push("--ingress " + this.ingress);
                this.commandLineArgs.push("--target-port " + this.targetPort);
            }
        }
        var environmentVariables = core.getInput('environmentVariables', { required: false });
        // Add user-specified environment variables
        if (!util.isNullOrEmpty(environmentVariables)) {
            // The --replace-env-vars flag is only used for the 'update' command,
            // otherwise --env-vars is used for 'create' and 'up'
            if (this.shouldUseUpdateCommand) {
                this.commandLineArgs.push("--replace-env-vars " + environmentVariables);
            }
            else {
                this.commandLineArgs.push("--env-vars " + environmentVariables);
            }
        }
    };
    /**
     * Creates or updates the Container App.
     */
    azurecontainerapps.createOrUpdateContainerApp = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.containerAppExists) return [3 /*break*/, 5];
                        if (!!util.isNullOrEmpty(this.yamlConfigPath)) return [3 /*break*/, 2];
                        // Create the Container App from the YAML configuration file
                        return [4 /*yield*/, this.appHelper.createContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath)];
                    case 1:
                        // Create the Container App from the YAML configuration file
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: 
                    // Create the Container App from command line arguments
                    return [4 /*yield*/, this.appHelper.createContainerApp(this.containerAppName, this.resourceGroup, this.containerAppEnvironment, this.imageToDeploy, this.commandLineArgs)];
                    case 3:
                        // Create the Container App from command line arguments
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                    case 5:
                        if (!util.isNullOrEmpty(this.yamlConfigPath)) {
                            // Update the Container App from the YAML configuration file
                            this.appHelper.updateContainerAppFromYaml(this.containerAppName, this.resourceGroup, this.yamlConfigPath);
                            return [2 /*return*/];
                        }
                        if (this.shouldUseUpdateCommand) {
                            // Update the ACR details on the existing Container App, if provided as an input
                            if (!util.isNullOrEmpty(this.acrName) && !util.isNullOrEmpty(this.acrUsername) && !util.isNullOrEmpty(this.acrPassword)) {
                                this.appHelper.updateContainerAppRegistryDetails(this.containerAppName, this.resourceGroup, this.acrName, this.acrUsername, this.acrPassword);
                            }
                            // Update the Container App using the 'update' command
                            this.appHelper.updateContainerApp(this.containerAppName, this.resourceGroup, this.imageToDeploy, this.commandLineArgs);
                        }
                        else {
                            // Update the Container App using the 'up' command
                            this.appHelper.updateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.imageToDeploy, this.commandLineArgs, this.ingress, this.targetPort);
                        }
                        // Disable ingress on the existing Container App, if provided as an input
                        if (this.ingress == 'disabled') {
                            this.appHelper.disableContainerAppIngress(this.containerAppName, this.resourceGroup);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Azure DevOps build properties
    azurecontainerapps.buildId = process.env.GITHUB_RUN_ID;
    azurecontainerapps.buildNumber = process.env.GITHUB_RUN_NUMBER;
    return azurecontainerapps;
}());
exports.azurecontainerapps = azurecontainerapps;
azurecontainerapps.runMain();
