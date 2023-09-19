import * as os from 'os'
import * as core from '@actions/core';
import * as exec from '@actions/exec';

export class CommandHelper {

    /**
     * Runs a command based on the OS of the agent running this task.
     * @param command - the command to execute
     * @returns the string output from the command
     */
    public async execCommandAsync(command: string): Promise<string> {
        return os.platform() == 'win32' ?
            await this.execPwshCommandAsync(command) :
            await this.execBashCommandAsync(command);
    }

    /**
     * @param command - the command to execute in Bash
     * @returns the string output from the command
     */
    private async execBashCommandAsync(command: string): Promise<string> {
        var bashOutput: string = '';
        var errorStream: string = '';

        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    bashOutput += data.toString();
                    core.info(data.toString());
                },
                stderr: (data: Buffer) => {
                    errorStream += data.toString();
                    core.error(data.toString());
                }
            },
            failOnStdErr: true,
            ignoreReturnCode: false,
            errStream: process.stderr,
            outStream: process.stdout,
        }
        try {
            var exitCode = await exec.exec('bash', ['-c', command], options);
            if (exitCode !== 0) {
                throw new Error(`Command failed with exit code ${exitCode}. Error stream: ${errorStream}`);
            }
            return bashOutput.trim();
        } catch (err) {
            core.setFailed(err.message);
            throw err;
        }
    }

    /**
     * Executes a given command using the pwsh executable.
     * @param command - the command to execute in PowerShell
     * @returns the string output from the command
     */
    private async execPwshCommandAsync(command: string): Promise<string> {
        var pwshOutput: string = '';
        var errorStream: string = '';
        const options: any = <exec.ExecOptions>{
            listeners: {
                stdout: (data: Buffer) => {
                    pwshOutput += data.toString();
                    core.info(data.toString());
                },
                stderr: (data: Buffer) => {
                    errorStream += data.toString();
                    core.error(data.toString());
                }
            },
            failOnStdErr: true,
            ignoreReturnCode: false,
            errStream: process.stderr,
            outStream: process.stdout,
        }
        try {
            var exitCode = await exec.exec('pwsh', [command], options);
            if (exitCode !== 0) {
                throw new Error(`Command failed with exit code ${exitCode}. Error stream: ${errorStream}`);
            }
            return pwshOutput.trim();
        } catch (err) {
            core.setFailed(err.message);
            throw err;
        }
    }
}