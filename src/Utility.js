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
exports.Utility = void 0;
var core = require("@actions/core");
var exec = require("@actions/exec");
var util = require("util");
var cpExec = util.promisify(require('child_process').exec);
var Utility = /** @class */ (function () {
    function Utility() {
    }
    /**
     * @param commandLine - the command to execute
     * @param args - the arguments to pass to the command
     * @param continueOnError - whether or not to continue execution if the command fails
     */
    Utility.prototype.executeAndthrowIfError = function (commandLine, args, continueOnError) {
        if (continueOnError === void 0) { continueOnError = false; }
        return __awaiter(this, void 0, void 0, function () {
            var stdout_1, stderr_1, options, exitCode, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        stdout_1 = '';
                        stderr_1 = '';
                        options = {
                            listeners: {
                                stdout: function (data) {
                                    stdout_1 += data.toString();
                                    core.info(data.toString());
                                },
                                stderr: function (data) {
                                    stderr_1 += data.toString();
                                    core.error(data.toString());
                                }
                            }
                        };
                        return [4 /*yield*/, exec.exec(commandLine, args, options)];
                    case 1:
                        exitCode = _a.sent();
                        if (!continueOnError && exitCode !== 0) {
                            core.error("Command failed with exit code " + exitCode + ". Error stream: " + stderr_1);
                            throw new Error("Command failed with exit code " + exitCode + ". Error stream: " + stderr_1);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        core.setFailed("Error: " + error_1.message);
                        throw error_1; // Re-throw the error
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the Azure CLI to dynamically install extensions that are missing. In this case, we care about the
     * Azure Container Apps module being dynamically installed while it's still in preview.
     */
    Utility.prototype.setAzureCliDynamicInstall = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cpExec("az config set extension.use_dynamic_install=yes_without_prompt")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks whether or not the provided string is null, undefined or empty.
     * @param str - the string to validate
     * @returns true if the string is null, undefined or empty, false otherwise
     */
    Utility.prototype.isNullOrEmpty = function (str) {
        return str === null || str === undefined || str === "";
    };
    return Utility;
}());
exports.Utility = Utility;
