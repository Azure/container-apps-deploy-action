// Note: This file is used to define utility functions that can be used across the project.
import { GitHubActionsToolHelper } from './GitHubActionsToolHelper';

const toolHelper = new GitHubActionsToolHelper();

export class Utility {
  /**
   * @param commandLine - the command to execute
   * @param args - the arguments to pass to the command
   * @param continueOnError - whether or not to continue execution if the command fails
   */

  public async execute(commandLine: string, args?: string[], inputOptions?:Buffer): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    return await toolHelper.exec(commandLine, args, inputOptions);
  }

  /**
   * Sets the Azure CLI to install the containerapp extension.
   */
  public async installAzureCliExtension() {
    await this.execute(`az extension add --name containerapp --version 0.3.46`);
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