import * as core from '@actions/core';
import * as exec from '@actions/exec';
export class Utility {
    /**
     * @param command - the command to execute
     * @param errormsg - the error message to display if the command failed
     */

     public async executeAndthrowIfError(commandToolPath: string, command: string, errormsg?: string): Promise<void> {
        try {
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

            const exitCode = await exec.exec(commandToolPath, [command], options);

            if (exitCode!== 0) {
              core.error(`Command failed with exit code ${exitCode}`);
              if (errormsg) {
                core.error(`Error Message: ${errormsg}`);
              }
              throw new Error(`Command failed with exit code ${exitCode}`);
            }
          } catch (error) {
            core.setFailed(`Error: ${error.message}`);
            throw error; // Re-throw the error
          }
    }

    public async executeAndReturnExitCode(pathToTool: string, command: string, errormsg?: string): Promise<number> {
        try {
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

            const exitCode = await exec.exec(pathToTool, [command], options);

            if (exitCode!== 0) {
              core.error(`Command failed with exit code ${exitCode}`);
              if (errormsg) {
                core.error(`Error Message: ${errormsg}`);
              }
              throw new Error(`Command failed with exit code ${exitCode}`);
            }
            return exitCode;
          } catch (error) {
            core.setFailed(`Error: ${error.message}`);
            throw error; // Re-throw the error
          }
    }

    public async executeAndReturnOutput(pathToTool: string, command: string, errormsg?: string): Promise<string> {
        try {
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

            const exitCode = await exec.exec(pathToTool, [command], options);

            if (exitCode!== 0) {
              core.error(`Command failed with exit code ${exitCode}`);
              if (errormsg) {
                core.error(`Error Message: ${errormsg}`);
              }
              throw new Error(`Command failed with exit code ${exitCode}`);
            }
            return stdout;
          } catch (error) {
            core.setFailed(`Error: ${error.message}`);
            throw error; // Re-throw the error
          }
    }


    /**
     * Sets the Azure CLI to dynamically install extensions that are missing. In this case, we care about the
     * Azure Container Apps module being dynamically installed while it's still in preview.
     */
    public setAzureCliDynamicInstall() {
        this.executeAndthrowIfError(
            `az config set extension.use_dynamic_install=yes_without_prompt`,
            `Unable to set Azure CLI to dynamically install extensions.`
            );
    }

    /**
     * Checks whether or not the provided string is null, undefined or empty.
     * @param str - the string to validate
     * @returns true if the string is null, undefined or empty, false otherwise
     */
    public isNullOrEmpty(str: string): boolean {
        return str === null || str === undefined || str === "";
    }
}