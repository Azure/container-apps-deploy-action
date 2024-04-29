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
    await this.execute(`az extension add --name containerapp --upgrade`);
  }

  /**
   * Checks whether or not the provided string is null, undefined or empty.
   * @param str - the string to validate
   * @returns true if the string is null, undefined or empty, false otherwise
   */
  public isNullOrEmpty(str: string): boolean {
    return str === null || str === undefined || str === "";
  }

  private parseCSV(input: string): string[] {
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
  public parseServices(input: string): string[] {
    const services: string[] = [];
    for (const line of input.split(/\r|\n/)) {
      const pieces = this.parseCSV(line);
      for (const piece of pieces) {
        services.push(piece);
      }
    }
    return services;
  }
}
