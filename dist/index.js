/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 5604:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(1245);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 5127:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(5604);
const file_command_1 = __nccwpck_require__(7352);
const utils_1 = __nccwpck_require__(1245);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const oidc_utils_1 = __nccwpck_require__(4457);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('ENV', file_command_1.prepareKeyValueMessage(name, val));
    }
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueFileCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    if (options && options.trimWhitespace === false) {
        return inputs;
    }
    return inputs.map(input => input.trim());
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    const filePath = process.env['GITHUB_OUTPUT'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('OUTPUT', file_command_1.prepareKeyValueMessage(name, value));
    }
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, utils_1.toCommandValue(value));
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    const filePath = process.env['GITHUB_STATE'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('STATE', file_command_1.prepareKeyValueMessage(name, value));
    }
    command_1.issueCommand('save-state', { name }, utils_1.toCommandValue(value));
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(9124);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(9124);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(7169);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 7352:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const uuid_1 = __nccwpck_require__(9267);
const utils_1 = __nccwpck_require__(1245);
function issueFileCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
    const delimiter = `ghadelimiter_${uuid_1.v4()}`;
    const convertedValue = utils_1.toCommandValue(value);
    // These should realistically never happen, but just in case someone finds a
    // way to exploit uuid generation let's not allow keys or values that contain
    // the delimiter.
    if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
    }
    if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
    }
    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
exports.prepareKeyValueMessage = prepareKeyValueMessage;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 4457:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(6227);
const auth_1 = __nccwpck_require__(5181);
const core_1 = __nccwpck_require__(5127);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 7169:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(1017));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 9124:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 1245:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 2049:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getExecOutput = exports.exec = void 0;
const string_decoder_1 = __nccwpck_require__(1576);
const tr = __importStar(__nccwpck_require__(1469));
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
/**
 * Exec a command and get the output.
 * Output will be streamed to the live console.
 * Returns promise with the exit code and collected stdout and stderr
 *
 * @param     commandLine           command to execute (can include additional args). Must be correctly escaped.
 * @param     args                  optional arguments for tool. Escaping is handled by the lib.
 * @param     options               optional exec options.  See ExecOptions
 * @returns   Promise<ExecOutput>   exit code, stdout, and stderr
 */
function getExecOutput(commandLine, args, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = '';
        let stderr = '';
        //Using string decoder covers the case where a mult-byte character is split
        const stdoutDecoder = new string_decoder_1.StringDecoder('utf8');
        const stderrDecoder = new string_decoder_1.StringDecoder('utf8');
        const originalStdoutListener = (_a = options === null || options === void 0 ? void 0 : options.listeners) === null || _a === void 0 ? void 0 : _a.stdout;
        const originalStdErrListener = (_b = options === null || options === void 0 ? void 0 : options.listeners) === null || _b === void 0 ? void 0 : _b.stderr;
        const stdErrListener = (data) => {
            stderr += stderrDecoder.write(data);
            if (originalStdErrListener) {
                originalStdErrListener(data);
            }
        };
        const stdOutListener = (data) => {
            stdout += stdoutDecoder.write(data);
            if (originalStdoutListener) {
                originalStdoutListener(data);
            }
        };
        const listeners = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.listeners), { stdout: stdOutListener, stderr: stdErrListener });
        const exitCode = yield exec(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
        //flush any remaining characters
        stdout += stdoutDecoder.end();
        stderr += stderrDecoder.end();
        return {
            exitCode,
            stdout,
            stderr
        };
    });
}
exports.getExecOutput = getExecOutput;
//# sourceMappingURL=exec.js.map

/***/ }),

/***/ 1469:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.argStringToArray = exports.ToolRunner = void 0;
const os = __importStar(__nccwpck_require__(2037));
const events = __importStar(__nccwpck_require__(2361));
const child = __importStar(__nccwpck_require__(2081));
const path = __importStar(__nccwpck_require__(1017));
const io = __importStar(__nccwpck_require__(2864));
const ioUtil = __importStar(__nccwpck_require__(1887));
const timers_1 = __nccwpck_require__(9512);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            return s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
            return '';
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            // root the tool path if it is unrooted and contains relative pathing
            if (!ioUtil.isRooted(this.toolPath) &&
                (this.toolPath.includes('/') ||
                    (IS_WINDOWS && this.toolPath.includes('\\')))) {
                // prefer options.cwd if it is specified, however options.cwd may also need to be rooted
                this.toolPath = path.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
            }
            // if the tool is only a file name, then resolve it from the PATH
            // otherwise verify it exists (add extension on Windows if necessary)
            this.toolPath = yield io.which(this.toolPath, true);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) {
                    return reject(new Error(`The cwd: ${this.options.cwd} does not exist!`));
                }
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                let stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                let errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
                if (this.options.input) {
                    if (!cp.stdin) {
                        throw new Error('child process missing stdin');
                    }
                    cp.stdin.end(this.options.input);
                }
            }));
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 5181:
/***/ (function(__unused_webpack_module, exports) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ 6227:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__nccwpck_require__(3685));
const https = __importStar(__nccwpck_require__(5687));
const pm = __importStar(__nccwpck_require__(603));
const tunnel = __importStar(__nccwpck_require__(7265));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
    readBodyBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const chunks = [];
                this.message.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                this.message.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            const res = yield this.get(requestUrl, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.post(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.put(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.patch(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
                    return response;
                }
                numTries += 1;
                if (numTries < maxTries) {
                    yield response.readBody();
                    yield this._performExponentialBackoff(numTries);
                }
            } while (numTries < maxTries);
            return response;
        });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        function handleResult(err, res) {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        }
        const req = info.httpModule.request(info.options, (msg) => {
            const res = new HttpClientResponse(msg);
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            for (const handler of this.handlers) {
                handler.prepareRequest(info.options);
            }
        }
        return info;
    }
    _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
            const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        });
    }
    _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const statusCode = res.message.statusCode || 0;
                const response = {
                    statusCode,
                    result: null,
                    headers: {}
                };
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
                        const a = new Date(value);
                        if (!isNaN(a.valueOf())) {
                            return a;
                        }
                    }
                    return value;
                }
                let obj;
                let contents;
                try {
                    contents = yield res.readBody();
                    if (contents && contents.length > 0) {
                        if (options && options.deserializeDates) {
                            obj = JSON.parse(contents, dateTimeDeserializer);
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 603:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        try {
            return new URL(proxyVar);
        }
        catch (_a) {
            if (!proxyVar.startsWith('http://') && !proxyVar.startsWith('https://'))
                return new URL(`http://${proxyVar}`);
        }
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const reqHost = reqUrl.hostname;
    if (isLoopbackAddress(reqHost)) {
        return true;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperNoProxyItem === '*' ||
            upperReqHosts.some(x => x === upperNoProxyItem ||
                x.endsWith(`.${upperNoProxyItem}`) ||
                (upperNoProxyItem.startsWith('.') &&
                    x.endsWith(`${upperNoProxyItem}`)))) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
function isLoopbackAddress(host) {
    const hostLower = host.toLowerCase();
    return (hostLower === 'localhost' ||
        hostLower.startsWith('127.') ||
        hostLower.startsWith('[::1]') ||
        hostLower.startsWith('[0:0:0:0:0:0:0:1]'));
}
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ 1887:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCmdPath = exports.tryGetExecutablePath = exports.isRooted = exports.isDirectory = exports.exists = exports.READONLY = exports.UV_FS_O_EXLOCK = exports.IS_WINDOWS = exports.unlink = exports.symlink = exports.stat = exports.rmdir = exports.rm = exports.rename = exports.readlink = exports.readdir = exports.open = exports.mkdir = exports.lstat = exports.copyFile = exports.chmod = void 0;
const fs = __importStar(__nccwpck_require__(7147));
const path = __importStar(__nccwpck_require__(1017));
_a = fs.promises
// export const {open} = 'fs'
, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.open = _a.open, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rm = _a.rm, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
// export const {open} = 'fs'
exports.IS_WINDOWS = process.platform === 'win32';
// See https://github.com/nodejs/node/blob/d0153aee367422d0858105abec186da4dff0a0c5/deps/uv/include/uv/win.h#L691
exports.UV_FS_O_EXLOCK = 0x10000000;
exports.READONLY = fs.constants.O_RDONLY;
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
// Get the path of cmd.exe in windows
function getCmdPath() {
    var _a;
    return (_a = process.env['COMSPEC']) !== null && _a !== void 0 ? _a : `cmd.exe`;
}
exports.getCmdPath = getCmdPath;
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 2864:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findInPath = exports.which = exports.mkdirP = exports.rmRF = exports.mv = exports.cp = void 0;
const assert_1 = __nccwpck_require__(9491);
const path = __importStar(__nccwpck_require__(1017));
const ioUtil = __importStar(__nccwpck_require__(1887));
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive, copySourceDirectory } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory() && copySourceDirectory
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Check for invalid characters
            // https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file
            if (/[*"<>|]/.test(inputPath)) {
                throw new Error('File path must not contain `*`, `"`, `<`, `>` or `|` on Windows');
            }
        }
        try {
            // note if path does not exist, error is silent
            yield ioUtil.rm(inputPath, {
                force: true,
                maxRetries: 3,
                recursive: true,
                retryDelay: 300
            });
        }
        catch (err) {
            throw new Error(`File was unable to be removed ${err}`);
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        yield ioUtil.mkdir(fsPath, { recursive: true });
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
            return result;
        }
        const matches = yield findInPath(tool);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return '';
    });
}
exports.which = which;
/**
 * Returns a list of all occurrences of the given tool on the system path.
 *
 * @returns   Promise<string[]>  the paths of the tool
 */
function findInPath(tool) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // build the list of extensions to try
        const extensions = [];
        if (ioUtil.IS_WINDOWS && process.env['PATHEXT']) {
            for (const extension of process.env['PATHEXT'].split(path.delimiter)) {
                if (extension) {
                    extensions.push(extension);
                }
            }
        }
        // if it's rooted, return it if exists. otherwise return empty.
        if (ioUtil.isRooted(tool)) {
            const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
            if (filePath) {
                return [filePath];
            }
            return [];
        }
        // if any path separators, return empty
        if (tool.includes(path.sep)) {
            return [];
        }
        // build the list of directories
        //
        // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
        // it feels like we should not do this. Checking the current directory seems like more of a use
        // case of a shell, and the which() function exposed by the toolkit should strive for consistency
        // across platforms.
        const directories = [];
        if (process.env.PATH) {
            for (const p of process.env.PATH.split(path.delimiter)) {
                if (p) {
                    directories.push(p);
                }
            }
        }
        // find all matches
        const matches = [];
        for (const directory of directories) {
            const filePath = yield ioUtil.tryGetExecutablePath(path.join(directory, tool), extensions);
            if (filePath) {
                matches.push(filePath);
            }
        }
        return matches;
    });
}
exports.findInPath = findInPath;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    const copySourceDirectory = options.copySourceDirectory == null
        ? true
        : Boolean(options.copySourceDirectory);
    return { force, recursive, copySourceDirectory };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 7265:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(2686);


/***/ }),

/***/ 2686:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 9267:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "v1", ({
  enumerable: true,
  get: function () {
    return _v.default;
  }
}));
Object.defineProperty(exports, "v3", ({
  enumerable: true,
  get: function () {
    return _v2.default;
  }
}));
Object.defineProperty(exports, "v4", ({
  enumerable: true,
  get: function () {
    return _v3.default;
  }
}));
Object.defineProperty(exports, "v5", ({
  enumerable: true,
  get: function () {
    return _v4.default;
  }
}));
Object.defineProperty(exports, "NIL", ({
  enumerable: true,
  get: function () {
    return _nil.default;
  }
}));
Object.defineProperty(exports, "version", ({
  enumerable: true,
  get: function () {
    return _version.default;
  }
}));
Object.defineProperty(exports, "validate", ({
  enumerable: true,
  get: function () {
    return _validate.default;
  }
}));
Object.defineProperty(exports, "stringify", ({
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
}));
Object.defineProperty(exports, "parse", ({
  enumerable: true,
  get: function () {
    return _parse.default;
  }
}));

var _v = _interopRequireDefault(__nccwpck_require__(940));

var _v2 = _interopRequireDefault(__nccwpck_require__(7052));

var _v3 = _interopRequireDefault(__nccwpck_require__(1545));

var _v4 = _interopRequireDefault(__nccwpck_require__(483));

var _nil = _interopRequireDefault(__nccwpck_require__(4418));

var _version = _interopRequireDefault(__nccwpck_require__(6433));

var _validate = _interopRequireDefault(__nccwpck_require__(659));

var _stringify = _interopRequireDefault(__nccwpck_require__(4886));

var _parse = _interopRequireDefault(__nccwpck_require__(8517));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 4576:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('md5').update(bytes).digest();
}

var _default = md5;
exports["default"] = _default;

/***/ }),

/***/ 4418:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports["default"] = _default;

/***/ }),

/***/ 8517:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(659));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports["default"] = _default;

/***/ }),

/***/ 3310:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports["default"] = _default;

/***/ }),

/***/ 1710:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = rng;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto.default.randomFillSync(rnds8Pool);

    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ 8315:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('sha1').update(bytes).digest();
}

var _default = sha1;
exports["default"] = _default;

/***/ }),

/***/ 4886:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(659));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports["default"] = _default;

/***/ }),

/***/ 940:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(1710));

var _stringify = _interopRequireDefault(__nccwpck_require__(4886));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports["default"] = _default;

/***/ }),

/***/ 7052:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(4837));

var _md = _interopRequireDefault(__nccwpck_require__(4576));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports["default"] = _default;

/***/ }),

/***/ 4837:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(__nccwpck_require__(4886));

var _parse = _interopRequireDefault(__nccwpck_require__(8517));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ 1545:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(1710));

var _stringify = _interopRequireDefault(__nccwpck_require__(4886));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports["default"] = _default;

/***/ }),

/***/ 483:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(4837));

var _sha = _interopRequireDefault(__nccwpck_require__(8315));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports["default"] = _default;

/***/ }),

/***/ 659:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _regex = _interopRequireDefault(__nccwpck_require__(3310));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports["default"] = _default;

/***/ }),

/***/ 6433:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(659));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports["default"] = _default;

/***/ }),

/***/ 1116:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.azurecontainerapps = void 0;
const fs = __nccwpck_require__(7147);
const path = __nccwpck_require__(1017);
const ContainerAppHelper_1 = __nccwpck_require__(1960);
const ContainerRegistryHelper_1 = __nccwpck_require__(9131);
const TelemetryHelper_1 = __nccwpck_require__(5456);
const Utility_1 = __nccwpck_require__(7723);
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const AddOnServicesHelper_1 = __nccwpck_require__(6231);
const buildArgumentRegex = /"[^"]*"|\S+/g;
const buildpackEnvironmentNameRegex = /^"?(BP|ORYX)_[-._a-zA-Z0-9]+"?$/;
class azurecontainerapps {
    static runMain() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initializeHelpers();
            this.toolHelper.writeDebug("Here it comes");
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
                // Set up property to trigger cloud build with 'up' command
                this.shouldCreateOrUpdateContainerAppWithUp = !this.util.isNullOrEmpty(this.appSourcePath) && this.useInternalRegistry;
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
        this.util = new Utility_1.Utility();
        // Set up toolHelper for managing calls to the GitHub Actions toolkit
        this.toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
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
        // Set up AddOnServicesHelper for managing add-on services
        this.addOnHelper = new AddOnServicesHelper_1.AddOnServicesHelper();
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
            this.resourceGroup = yield this.getOrCreateResourceGroup(this.containerAppName, this.location);
            // Determine if the Container Appp currently exists
            this.containerAppExists = yield this.appHelper.doesContainerAppExist(this.containerAppName, this.resourceGroup);
            // If the Container App doesn't exist, get/create the Container App Environment to use for the Container App
            if (!this.containerAppExists) {
                this.containerAppEnvironment = yield this.getOrCreateContainerAppEnvironment(this.containerAppName, this.resourceGroup, this.location);
            }
            this.addOnServices = yield this.createAddOnServices(this.containerAppName, this.resourceGroup, this.containerAppEnvironment);
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
    static getOrCreateResourceGroup(containerAppName, location) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the resource group to deploy to if it was provided, or generate it from the Container App name
            let resourceGroup = this.toolHelper.getInput('resourceGroup', false);
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
     * Create add-on services if required. A name for the service is generated by prefixing the given
     * service name with container name. For example, if you have given redis add-on service "myredis" name,
     * then the actual service name will be generated in the form '<containerAppName>-<addon-type>-myredis'.
     *
     * This is done to ensure that we have only one add-on service of a type for a given container.
     *
     * @param containerAppName - The name of the Container App to use for the task.
     * @param resourceGroup - The name of the resource group to use for the task.
     * @param environment - the Container App Environment that will be associated with the add-on
     * @returns The name of the Container App Environment to use for the task.
     */
    static createAddOnServices(containerAppName, resourceGroup, environment) {
        return __awaiter(this, void 0, void 0, function* () {
            let createdServices = [];
            console.log("addons", this.addOnTypes);
            for (const addOn of this.addOnTypes) {
                console.log(`addon is ${addOn}.`);
                let services = this.toolHelper.getInput(addOn, false);
                console.log("services", services);
                if (!this.util.isNullOrEmpty(services)) {
                    let bindings = this.util.parseServices(services);
                    console.log("bindinds", bindings);
                    for (const binding in bindings) {
                        let bindingName = `${containerAppName}-${addOn}-${binding}`;
                        yield this.addOnHelper.createAddOnService(addOn, bindingName, resourceGroup, environment);
                        createdServices.push(bindingName);
                    }
                }
            }
            return createdServices;
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
        if (!(this.addOnServices === null || this.addOnServices === undefined || this.addOnServices.length == 0)) {
            for (const addOnService in this.addOnServices) {
                this.commandLineArgs.push(`--bind ${addOnService}`);
            }
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
        const isCappUpdateCommandUsed = this.containerAppExists && (!this.shouldCreateOrUpdateContainerAppWithUp && (!this.adminCredentialsProvided || this.noIngressUpdate));
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
        else if (this.shouldCreateOrUpdateContainerAppWithUp) {
            this.commandLineArgs.push(`--source ${this.appSourcePath}`);
            this.commandLineArgs.push(`-l ${this.location}`);
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
                else if (this.shouldCreateOrUpdateContainerAppWithUp) {
                    yield this.appHelper.createOrUpdateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
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
            if (this.noIngressUpdate && !this.shouldCreateOrUpdateContainerAppWithUp) {
                // Update the Container Registry details on the existing Container App, if provided as an input
                if (!this.util.isNullOrEmpty(this.registryUrl) && !this.util.isNullOrEmpty(this.registryUsername) && !this.util.isNullOrEmpty(this.registryPassword)) {
                    yield this.appHelper.updateContainerAppRegistryDetails(this.containerAppName, this.resourceGroup, this.registryUrl, this.registryUsername, this.registryPassword);
                }
                // Update the Container App using the 'update' command
                yield this.appHelper.updateContainerApp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
            }
            else if (this.shouldCreateOrUpdateContainerAppWithUp) {
                yield this.appHelper.createOrUpdateContainerAppWithUp(this.containerAppName, this.resourceGroup, this.commandLineArgs);
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
}
exports.azurecontainerapps = azurecontainerapps;
azurecontainerapps.addOnTypes = ['kafka', 'mariadb', 'milvus', 'postgres', 'qdrant', 'redis', 'weaviate'];
azurecontainerapps.runMain();


/***/ }),

/***/ 6231:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddOnServicesHelper = void 0;
const Utility_1 = __nccwpck_require__(7723);
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
const util = new Utility_1.Utility();
class AddOnServicesHelper {
    /**
     * Creates or updates an add-on service.
     * @param addOnType - the type of the add-on binding. This could be one of the following:
     * kafka, redis, postres, qrant, mariadb, milvus, and weaviate.
     * @param bindingName - the name of the add-on binding
     * @param resourceGroup - the name of the resource group to use for the task.
     * @param environment - the Container App Environment that will be associated with the add-on
     */
    createAddOnService(addOnType, bindingName, resourceGroup, environment) {
        return __awaiter(this, void 0, void 0, function* () {
            toolHelper.writeDebug(`Attempting to create a ${addOnType} binding service ${bindingName}`);
            try {
                yield util.execute(`az containerapp add-on ${addOnType} create --name ${bindingName} --environment ${environment} --resource-group ${resourceGroup}`);
            }
            catch (err) {
                toolHelper.writeError(`Failed to create add-on binding ${bindingName} in resource group ${resourceGroup} and environment ${environment}`);
                throw err;
            }
        });
    }
}
exports.AddOnServicesHelper = AddOnServicesHelper;


/***/ }),

/***/ 1960:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContainerAppHelper = void 0;
const path = __nccwpck_require__(1017);
const os = __nccwpck_require__(2037);
const Utility_1 = __nccwpck_require__(7723);
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const fs = __nccwpck_require__(7147);
const ORYX_CLI_IMAGE = 'mcr.microsoft.com/oryx/cli:builder-debian-bullseye-20230926.1';
const ORYX_BULLSEYE_BUILDER_IMAGE = 'mcr.microsoft.com/oryx/builder:debian-bullseye-20240124.1';
const ORYX_BOOKWORM_BUILDER_IMAGE = 'mcr.microsoft.com/oryx/builder:debian-bookworm-20240124.1';
const ORYX_BUILDER_IMAGES = [ORYX_BULLSEYE_BUILDER_IMAGE, ORYX_BOOKWORM_BUILDER_IMAGE];
const IS_WINDOWS_AGENT = os.platform() == 'win32';
const PACK_CMD = IS_WINDOWS_AGENT ? path.join(os.tmpdir(), 'pack') : 'pack';
const toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
const util = new Utility_1.Utility();
class ContainerAppHelper {
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
}
exports.ContainerAppHelper = ContainerAppHelper;


/***/ }),

/***/ 9131:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContainerRegistryHelper = void 0;
const os = __nccwpck_require__(2037);
const Utility_1 = __nccwpck_require__(7723);
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
const util = new Utility_1.Utility();
class ContainerRegistryHelper {
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
}
exports.ContainerRegistryHelper = ContainerRegistryHelper;


/***/ }),

/***/ 6649:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitHubActionsToolHelper = void 0;
const core = __nccwpck_require__(5127);
const io = __nccwpck_require__(2864);
const exec = __nccwpck_require__(2049);
class GitHubActionsToolHelper {
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
}
exports.GitHubActionsToolHelper = GitHubActionsToolHelper;


/***/ }),

/***/ 5456:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryHelper = void 0;
const Utility_1 = __nccwpck_require__(7723);
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const ORYX_CLI_IMAGE = "mcr.microsoft.com/oryx/cli:debian-buster-20230207.2";
const SUCCESSFUL_RESULT = "succeeded";
const FAILED_RESULT = "failed";
const BUILDER_SCENARIO = "used-builder";
const DOCKERFILE_SCENARIO = "used-dockerfile";
const IMAGE_SCENARIO = "used-image";
const util = new Utility_1.Utility();
const toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
class TelemetryHelper {
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
}
exports.TelemetryHelper = TelemetryHelper;


/***/ }),

/***/ 7723:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utility = void 0;
// Note: This file is used to define utility functions that can be used across the project.
const GitHubActionsToolHelper_1 = __nccwpck_require__(6649);
const toolHelper = new GitHubActionsToolHelper_1.GitHubActionsToolHelper();
class Utility {
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
    parseCSV(input) {
        input = (input || '').trim();
        if (!input) {
            return [];
        }
        const list = input.split(/(?<!\\),/gi);
        for (let i = 0; i < list.length; i++) {
            list[i] = list[i].trim().replace(/\\,/gi, ',');
        }
        return list;
    }
    /**
     * Accepts the actions string input of add-on services and parses them as Array.
     *
     * @param input String of services, from the actions input, can be
     * comma-delimited or newline, whitespace around services entires is removed.
     * @returns Array of string for each service input, in the same order they were
     * given.
     */
    parseServices(input) {
        const services = [];
        for (const line of input.split(/\r|\n/)) {
            const pieces = this.parseCSV(line);
            for (const piece of pieces) {
                services.push(piece);
            }
        }
        return services;
    }
}
exports.Utility = Utility;


/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 2081:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 1576:
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");

/***/ }),

/***/ 9512:
/***/ ((module) => {

"use strict";
module.exports = require("timers");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(1116);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;