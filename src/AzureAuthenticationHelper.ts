import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as fs from 'fs';
import { Utility } from './Utility';

export class AzureAuthenticationHelper {

    private sessionLoggedIn: boolean = false;
    private cliPasswordPath: string = null;

    /**
     * Re-uses the loginAzureRM code implemented by the AzureCLIV2 Azure DevOps Task.
     * https://github.com/microsoft/azure-pipelines-tasks/blob/b82a8e69eb862d1a9d291af70da2e62ee69270df/Tasks/AzureCLIV2/azureclitask.ts#L106-L150
     * @param connectedService - an Azure DevOps Service Connection that can authorize the connection to Azure
     */


    /**
     * Re-uses the logoutAzure code implemented by the AzureCLIV2 Azure DevOps Task.
     * https://github.com/microsoft/azure-pipelines-tasks/blob/b82a8e69eb862d1a9d291af70da2e62ee69270df/Tasks/AzureCLIV2/azureclitask.ts#L175-L183
     */
    public logoutAzure() {
        if (this.cliPasswordPath) {
            core.debug('Removing spn certificate file');
            io.rmRF(this.cliPasswordPath);  // Remove the certificate file
        }

        if (this.sessionLoggedIn) {
            core.debug('Attempting to log out from Azure');
            try {
                exec.exec('az account clear')
            } catch (err) {
                // task should not fail if logout doesn`t occur
                core.warning(`The following error occurred while logging out: ${err.message}`);
            }
        }
    }
}

