import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { CommandHelper } from './CommandHelper';
import { Utility } from './Utility';

export class ContainerRegistryHelper {
    /**
     * Authorizes Docker to make calls to the provided ACR instance using username and password.
     * @param acrName - the name of the ACR instance to authenticate calls to
     * @param acrUsername - the username for authentication
     * @param acrPassword - the password for authentication
     */
     public loginAcrWithUsernamePassword(acrName: string, acrUsername: string, acrPassword: string) {
        core.debug(`Attempting to log in to ACR instance "${acrName}" with username and password credentials`);
        try {
            exec.exec('docker', [`login`, `--password-stdin`, `--username`, `${acrUsername}`, `${acrName}.azurecr.io`], { input: Buffer.from(acrPassword) });
        } catch (err) {
            core.error(`Failed to log in to ACR instance "${acrName}" with username and password credentials`);
            throw err;
        }
    }

    /**
     * Authorizes Docker to make calls to the provided ACR instance using an access token that is generated via
     * the 'az acr login --expose-token' command.
     * @param acrName - the name of the ACR instance to authenticate calls to.
     */
     public async loginAcrWithAccessTokenAsync(acrName: string) {
        core.debug(`Attempting to log in to ACR instance "${acrName}" with access token`);
        try {
            const command: string = `CA_ADO_TASK_ACR_ACCESS_TOKEN=$(az acr login --name ${acrName} --output json --expose-token --only-show-errors | jq -r '.accessToken'); docker login ${acrName}.azurecr.io -u 00000000-0000-0000-0000-000000000000 -p $CA_ADO_TASK_ACR_ACCESS_TOKEN > /dev/null 2>&1`;
            await new CommandHelper().execCommandAsync(command);
        } catch (err) {
            core.error(`Failed to log in to ACR instance "${acrName}" with access token`)
            throw err;
        }
    }

    /**
     * Pushes an image to the ACR instance that was previously authenticated against.
     * @param imageToPush - the name of the image to push to ACR
     */
     public async pushImageToAcr(imageToPush: string) {
        core.debug(`Attempting to push image "${imageToPush}" to ACR`);
        try {
            const dockerTool: string = await io.which("docker", true);
            exec.exec(dockerTool, [`push`, `${imageToPush}`])
            core.info(`Successfully pushed image "${imageToPush}" to ACR`);
            // const dockerTool: string = await io.which("docker", true);
            // new Utility().executeAndthrowIfError(
            //     `${dockerTool}`,
            //     `push ${imageToPush}`,
            //     `Failed to push image "${imageToPush}" to ACR`
            // );

        } catch (err) {
            core.error(`Failed to push image "${imageToPush}" to ACR`);
            core.error(err.message);
            throw err;
        }
    }
}