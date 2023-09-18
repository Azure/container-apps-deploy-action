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
exports.TelemetryHelper = void 0;
var core = require("@actions/core");
var Utility_1 = require("./Utility");
var exec = require("@actions/exec");
var io = require("@actions/io");
var ORYX_CLI_IMAGE = "mcr.microsoft.com/oryx/cli:debian-buster-20230207.2";
var SUCCESSFUL_RESULT = "succeeded";
var FAILED_RESULT = "failed";
var BUILDER_SCENARIO = "used-builder";
var DOCKERFILE_SCENARIO = "used-dockerfile";
var IMAGE_SCENARIO = "used-image";
var util = new Utility_1.Utility();
var TelemetryHelper = /** @class */ (function () {
    function TelemetryHelper(disableTelemetry) {
        this.disableTelemetry = disableTelemetry;
        this.taskStartMilliseconds = Date.now();
    }
    /**
     * Marks that the task was successful in telemetry.
     */
    TelemetryHelper.prototype.setSuccessfulResult = function () {
        this.result = SUCCESSFUL_RESULT;
    };
    /**
     * Marks that the task failed in telemetry.
     */
    TelemetryHelper.prototype.setFailedResult = function (errorMessage) {
        this.result = FAILED_RESULT;
        this.errorMessage = errorMessage;
    };
    /**
     * Marks that the task used the builder scenario.
     */
    TelemetryHelper.prototype.setBuilderScenario = function () {
        this.scenario = BUILDER_SCENARIO;
    };
    /**
     * Marks that the task used the Dockerfile scenario.
     */
    TelemetryHelper.prototype.setDockerfileScenario = function () {
        this.scenario = DOCKERFILE_SCENARIO;
    };
    /**
     * Marks that the task used the previously built image scenario.
     */
    TelemetryHelper.prototype.setImageScenario = function () {
        this.scenario = IMAGE_SCENARIO;
    };
    /**
     * If telemetry is enabled, uses the "oryx telemetry" command to log metadata about this task execution.
     */
    TelemetryHelper.prototype.sendLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var taskLengthMilliseconds, resultArg, scenarioArg, errorMessageArg, args, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskLengthMilliseconds = Date.now() - this.taskStartMilliseconds;
                        if (!!this.disableTelemetry) return [3 /*break*/, 4];
                        core.debug("Telemetry enabled; logging metadata about task result, length and scenario targeted.");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        resultArg = '';
                        if (!util.isNullOrEmpty(this.result)) {
                            resultArg = "--property 'result=" + this.result + "'";
                        }
                        scenarioArg = '';
                        if (!util.isNullOrEmpty(this.scenario)) {
                            scenarioArg = "--property 'scenario=" + this.scenario + "'";
                        }
                        errorMessageArg = '';
                        if (!util.isNullOrEmpty(this.errorMessage)) {
                            errorMessageArg = "--property 'errorMessage=" + this.errorMessage + "'";
                        }
                        args = ["run", "--rm", "" + ORYX_CLI_IMAGE, "/bin/bash", "-c", "oryx telemetry --event-name 'ContainerAppsPipelinesTaskRCV1' " + ("--processing-time '" + taskLengthMilliseconds + "' " + resultArg + " " + scenarioArg + " " + errorMessageArg + "\"")];
                        // const dockerCommand = `run --rm ${ORYX_CLI_IMAGE} /bin/bash -c "oryx telemetry --event-name 'ContainerAppsPipelinesTaskRCV1' ` +
                        // `--processing-time '${taskLengthMilliseconds}' ${resultArg} ${scenarioArg} ${errorMessageArg}"`
                        // Don't use Utility's throwIfError() since it will still record an error in the pipeline logs, but won't fail the task
                        return [4 /*yield*/, executeDockerCommand(args, true)];
                    case 2:
                        // const dockerCommand = `run --rm ${ORYX_CLI_IMAGE} /bin/bash -c "oryx telemetry --event-name 'ContainerAppsPipelinesTaskRCV1' ` +
                        // `--processing-time '${taskLengthMilliseconds}' ${resultArg} ${scenarioArg} ${errorMessageArg}"`
                        // Don't use Utility's throwIfError() since it will still record an error in the pipeline logs, but won't fail the task
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        core.warning("Skipping telemetry logging due to the following exception: " + err_1.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TelemetryHelper;
}());
exports.TelemetryHelper = TelemetryHelper;
var executeDockerCommand = function (args, continueOnError) {
    if (continueOnError === void 0) { continueOnError = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var dockerTool, errorStream, execOptions, exitCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, io.which("docker", true)];
                case 1:
                    dockerTool = _a.sent();
                    errorStream = '';
                    execOptions = {
                        listeners: {
                            stdout: function (data) { return console.log(data.toString()); }
                        }
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 6]);
                    return [4 /*yield*/, exec.exec(dockerTool, args, execOptions)];
                case 3:
                    exitCode = _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    if (!continueOnError) {
                        throw error_1;
                    }
                    core.warning(error_1);
                    return [3 /*break*/, 6];
                case 5:
                    if (exitCode !== 0 && !continueOnError) {
                        throw new Error(errorStream || 'az cli script failed.');
                    }
                    core.warning(errorStream);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
};
