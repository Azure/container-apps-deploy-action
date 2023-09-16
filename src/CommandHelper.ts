import * as os from 'os'
import * as core from '@actions/core';
import * as exec from '@actions/exec';

export class CommandHelper {

    /**
     * Runs a command based on the OS of the agent running this task.
     * @param command - the command to execute
     * @param cwd - the current working directory; if not provided, the 'cwd' input will be used
     * @returns the string output from the command
     */
    public async execCommandAsync(command: string): Promise<string> {
        return os.platform() == 'win32' ?
            this.execPwshCommandAsync(command) :
            this.execBashCommandAsync(command);
    }

    /**
     * @param command - the command to execute in Bash
     * @param cwd - the current working directory; if not provided, the 'cwd' input will be used
     * @returns the string output from the command
     */
    private async execBashCommandAsync(command: string): Promise<string> {
        var bashOutput: string = '';
        const options: exec.ExecOptions = <exec.ExecOptions>{
            listeners: {
                stdout: (data: Buffer) => {
                    process.stdout.write(data);
                    bashOutput += data.toString();
                },
                stderr: (data: Buffer) => {
                    process.stderr.write(data);
                }
            },
            failOnStdErr: true,
            ignoreReturnCode: false,
            errStream: process.stderr,
            outStream: process.stdout,
        }
        try {
            await new Promise<void>((resolve, reject) => {
                exec.exec('bash', ['-c', command], options)
                    .then(() => resolve())
                    .catch((error: Error) => reject(error));
            });
            return bashOutput.trim();
        } catch (err) {
            core.error('Unable to run provided bash command ${command}');
            throw err;
        }
    }

    /**
     * Executes a given command using the pwsh executable.
     * @param command - the command to execute in PowerShell
     * @param cwd - the current working directory; if not provided, the 'cwd' input will be used
     * @returns the string output from the command
     */
    private async execPwshCommandAsync(command: string): Promise<string> {
        var pwshOutput: string = '';
        const options: exec.ExecOptions = <exec.ExecOptions>{
            listeners: {
                stdout: (data: Buffer) => {
                    process.stdout.write(data);
                    pwshOutput += data.toString();
                },
                stderr: (data: Buffer) => {
                    process.stderr.write(data);
                }
            },
            failOnStdErr: true,
            ignoreReturnCode: false,
            errStream: process.stderr,
            outStream: process.stdout,
        }
        try {
            await new Promise<void>((resolve, reject) => {
                exec.exec('pwsh', ['-c', command], options)
                    .then(() => resolve())
                    .catch((error: Error) => reject(error));
            });
            return pwshOutput.trim();
        } catch (err) {
            core.error('Unable to run provided PowerShell command ${command}');
            throw err;
        }
    }
}