import * as core from '@actions/core';
import * as io from '@actions/io';
import * as exec from '@actions/exec';

export class GitHubActionsToolHelper {

    public getBuildId(): string {
        return process.env['GITHUB_RUN_ID'] || '';
    }

    public getBuildNumber(): string {
        return process.env['GITHUB_RUN_NUMBER'] || '';
    }

    public writeInfo(message: string): void {
        core.info(message);
    }

    public writeError(message: string): void {
        core.error(message);
    }

    public writeWarning(message: string): void {
        core.warning(message);
    }

    public writeDebug(message: string): void {
        core.debug(message);
    }

    public async exec(commandLine: string, args?: string[], inputOptions?: Buffer): Promise<{ exitCode: number, stdout: string, stderr: string }> {
        try{
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
            input: inputOptions
        };

        let exitCode =  await exec.exec(commandLine, args, options);
        return new Promise((resolve, reject) => {
            let executionResult = {
              exitCode: exitCode,
              stdout: stdout,
              stderr: stderr
            }
            resolve(executionResult);
          });
        }catch(err){
            throw err;
        }
    }

    public getInput(name: string, required?: boolean): string {
        const options: core.InputOptions = {
            required:required
        }
        return core.getInput(name, options);
    }

    public setFailed(message: string): void {
        core.setFailed(message);
    }

    public which(tool: string, check?: boolean): Promise<string> {
        return io.which(tool, check);
    }

    public getDefaultContainerAppName(containerAppName: string): string {
        containerAppName = `gh-action-app-${this.getBuildId()}-${this.getBuildNumber()}`;
        // Replace all '.' characters with '-' characters in the Container App name
        containerAppName = containerAppName.replace(/\./gi, "-");
        this.writeInfo(`Default Container App name: ${containerAppName}`);
        return containerAppName;
    }

    public getTelemetryArg(): string {
        return `CALLER_ID=github-actions-v2`;
    }

    public getEventName(): string {
        return `ContainerAppsGitHubActionV2`;
    }

    public getDefaultImageRepository(): string {
        return `gh-action/container-app`;
    }
}