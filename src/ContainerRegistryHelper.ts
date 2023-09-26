import * as os from 'os';
import { Utility } from './Utility';
import { GithubActionsToolHelper } from './GithubActionsToolHelper';

const githubActionsToolHelper = new GithubActionsToolHelper();
const util = new Utility();

export class ContainerRegistryHelper {
    /**
     * Authorizes Docker to make calls to the provided ACR instance using username and password.
     * @param acrName - the name of the ACR instance to authenticate calls to
     * @param acrUsername - the username for authentication
     * @param acrPassword - the password for authentication
     */
    public async loginAcrWithUsernamePassword(acrName: string, acrUsername: string, acrPassword: string) {
        githubActionsToolHelper.debug(`Attempting to log in to ACR instance "${acrName}" with username and password credentials`);
        try {
            await githubActionsToolHelper.exec('docker', [`login`, `--password-stdin`, `--username`, `${acrUsername}`, `${acrName}.azurecr.io`], { input: Buffer.from(acrPassword) });
        } catch (err) {
            githubActionsToolHelper.error(`Failed to log in to ACR instance "${acrName}" with username and password credentials`);
            throw err;
        }
    }

    /**
     * Authorizes Docker to make calls to the provided ACR instance using an access token that is generated via
     * the 'az acr login --expose-token' command.
     * @param acrName - the name of the ACR instance to authenticate calls to.
     */
    public async loginAcrWithAccessTokenAsync(acrName: string) {
        githubActionsToolHelper.debug(`Attempting to log in to ACR instance "${acrName}" with access token`);
        try {
            let command: string = `CA_ADO_TASK_ACR_ACCESS_TOKEN=$(az acr login --name ${acrName} --output json --expose-token --only-show-errors | jq -r '.accessToken'); docker login ${acrName}.azurecr.io -u 00000000-0000-0000-0000-000000000000 -p $CA_ADO_TASK_ACR_ACCESS_TOKEN > /dev/null 2>&1`;
            let commandLine = os.platform() === 'win32' ? 'pwsh' : 'bash';
            await util.executeAndThrowIfError(commandLine, ['-c', command]);
        } catch (err) {
            githubActionsToolHelper.error(`Failed to log in to ACR instance "${acrName}" with access token`)
            throw err;
        }
    }

    /**
     * Pushes an image to the ACR instance that was previously authenticated against.
     * @param imageToPush - the name of the image to push to ACR
     */
    public async pushImageToAcr(imageToPush: string) {
        githubActionsToolHelper.debug(`Attempting to push image "${imageToPush}" to ACR`);
        try {
            let dockerTool: string = await githubActionsToolHelper.which("docker", true);
            await util.executeAndThrowIfError(dockerTool, [`push`, `${imageToPush}`]);
        } catch (err) {
            githubActionsToolHelper.error(`Failed to push image "${imageToPush}" to ACR. Error: ${err.message}`);
            throw err;
        }
    }
}