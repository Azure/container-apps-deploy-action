import * as core from '@actions/core';
import * as io from '@actions/io';
import * as exec from '@actions/exec';

export class GithubActionsToolHelper {

    public getGithubRunId(): string {
        return process.env['GITHUB_RUN_ID'] || '';
    }

    public getGithubRunNumber(): string {
        return process.env['GITHUB_RUN_NUMBER'] || '';
    }

    public info(message: string): void {
        core.info(message);
    }

    public error(message: string): void {
        core.error(message);
    }

    public warning(message: string): void {
        core.warning(message);
    }

    public debug(message: string): void {
        core.debug(message);
    }

    public async exec(commandLine: string, args?: string[], execOptions?: exec.ExecOptions): Promise<number> {
        return await exec.exec(commandLine, args, execOptions);
    }

    public async ExecOptions(): Promise<exec.ExecOptions> {
        let stdout = '';
        let stderr = '';

        const options: exec.ExecOptions = {
            listeners: {
                stdout: (data: Buffer) => {
                    stdout += data.toString();
                },
                stderr: (data: Buffer) => {
                    stderr += data.toString();
                },
            },
        };
        return options;
    }

    public getInput(name: string, options?: core.InputOptions): string {
        return core.getInput(name, options);
    }

    public setFailed(message: string): void {
        core.setFailed(message);
    }

    public which(tool: string, check?: boolean): Promise<string> {
        return io.which(tool, check);
    }

    public getContainerAppName(containerAppName: string): string {
        containerAppName = `gh-action-app-${this.getGithubRunId()}-${this.getGithubRunNumber()}`;
        // Replace all '.' characters with '-' characters in the Container App name
        containerAppName = containerAppName.replace(/\./gi, "-");
        this.info(`Default Container App name: ${containerAppName}`);
        return containerAppName
    }

    public getTelemetryArg(): string {
        return `CALLER_ID=github-actions-v1`;
    }
}