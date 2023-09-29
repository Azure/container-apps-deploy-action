// Note: This file is used to define utility functions that can be used across the project.
import { GitHubActionsToolHelper } from './GitHubActionsToolHelper';

const toolHelper = new GitHubActionsToolHelper();

export class Utility {
  /**
   * @param commandLine - the command to execute
   * @param args - the arguments to pass to the command
   * @param continueOnError - whether or not to continue execution if the command fails
   */

  public async executeAndThrowIfError(commandLine: string, args?: string[], inputOptions?:Buffer): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    try {
      return await toolHelper.exec(commandLine, args, inputOptions);
    } catch (error) {
      toolHelper.writeError(`Error: ${error.message}`);
      throw error; // Re-throw the error
    }
  }

  /**
   * Sets the Azure CLI to dynamically install extensions that are missing. In this case, we care about the
   * Azure Container Apps module being dynamically installed while it's still in preview.
   */
  public async setAzureCliDynamicInstall() {
    await this.executeAndThrowIfError(`az config set extension.use_dynamic_install=yes_without_prompt`);
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