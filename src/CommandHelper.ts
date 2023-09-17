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
            this.execPwshCommandAsync(command) :
            this.execBashCommandAsync(command);
    }

    /**
     * @param command - the command to execute in Bash
     * @returns the string output from the command
     */
    private async execBashCommandAsync(command: string): Promise<string> {
        var bashOutput: string = '';

        const options: any = {
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
            await exec.exec('bash',['-c', command], options);
            return bashOutput.trim();
        } catch (err) {
            core.error('Unable to run provided bash command ${command}');
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
        const options: any = <exec.ExecOptions>{
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
            await exec.exec('pwsh',['-c', command], options);
            return pwshOutput.trim();
        } catch (err) {
            core.error('Unable to run provided PowerShell command ${command}');
            throw err;
        }
    }
}