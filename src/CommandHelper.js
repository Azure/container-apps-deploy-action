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
exports.CommandHelper = void 0;
var os = require("os");
var core = require("@actions/core");
var exec = require("@actions/exec");
var CommandHelper = /** @class */ (function () {
    function CommandHelper() {
    }
    /**
     * Runs a command based on the OS of the agent running this task.
     * @param command - the command to execute
     * @returns the string output from the command
     */
    CommandHelper.prototype.execCommandAsync = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, os.platform() == 'win32' ?
                        this.execPwshCommandAsync(command) :
                        this.execBashCommandAsync(command)];
            });
        });
    };
    /**
     * @param command - the command to execute in Bash
     * @returns the string output from the command
     */
    CommandHelper.prototype.execBashCommandAsync = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var bashOutput, options, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bashOutput = '';
                        options = {
                            listeners: {
                                stdout: function (data) {
                                    process.stdout.write(data);
                                    bashOutput += data.toString();
                                },
                                stderr: function (data) {
                                    process.stderr.write(data);
                                }
                            },
                            failOnStdErr: true,
                            ignoreReturnCode: false,
                            errStream: process.stderr,
                            outStream: process.stdout
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, exec.exec('bash', ['-c', command], options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, bashOutput.trim()];
                    case 3:
                        err_1 = _a.sent();
                        core.error('Unable to run provided bash command ${command}');
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a given command using the pwsh executable.
     * @param command - the command to execute in PowerShell
     * @returns the string output from the command
     */
    CommandHelper.prototype.execPwshCommandAsync = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var pwshOutput, options, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pwshOutput = '';
                        options = {
                            listeners: {
                                stdout: function (data) {
                                    process.stdout.write(data);
                                    pwshOutput += data.toString();
                                },
                                stderr: function (data) {
                                    process.stderr.write(data);
                                }
                            },
                            failOnStdErr: true,
                            ignoreReturnCode: false,
                            errStream: process.stderr,
                            outStream: process.stdout
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, exec.exec('pwsh', ['-c', command], options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, pwshOutput.trim()];
                    case 3:
                        err_2 = _a.sent();
                        core.error('Unable to run provided PowerShell command ${command}');
                        throw err_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CommandHelper;
}());
exports.CommandHelper = CommandHelper;
