import * as os from 'os';
import { Utility } from './Utility';
import { GitHubActionsToolHelper } from './GitHubActionsToolHelper';

const toolHelper = new GitHubActionsToolHelper();
const util = new Utility();

export class ContainerRegistryHelper {
    /**
     * Authorizes Docker to make calls to the provided ACR instance using username and password.
     * @param acrName - the name of the ACR instance to authenticate calls to
     * @param acrUsername - the username for authentication
     * @param acrPassword - the password for authentication
     */
    public async loginAcrWithUsernamePassword(acrName: string, acrUsername: string, acrPassword: string) {
        toolHelper.writeDebug(`Attempting to log in to ACR instance "${acrName}" with username and password credentials`);
        try {
            await util.execute(`docker login --username ${acrUsername} --password ${acrPassword} ${acrName}.azurecr.io`, [], Buffer.from(acrPassword));
        } catch (err) {
            toolHelper.writeError(`Failed to log in to ACR instance "${acrName}" with username and password credentials`);
            throw err;
        }
    }

    /**
     * Authorizes Docker to make calls to the provided ACR instance using an access token that is generated via
     * the 'az acr login --expose-token' command.
     * @param acrName - the name of the ACR instance to authenticate calls to.
     */
    public async loginAcrWithAccessTokenAsync(acrName: string) {
        toolHelper.writeDebug(`Attempting to log in to ACR instance "${acrName}" with access token`);
        try {
            let commandLine = os.platform() === 'win32' ? 'pwsh' : 'bash';
            await util.execute(`${commandLine} -c "CA_ADO_TASK_ACR_ACCESS_TOKEN=$(az acr login --name ${acrName} --output json --expose-token --only-show-errors | jq -r '.accessToken'); docker login ${acrName}.azurecr.io -u 00000000-0000-0000-0000-000000000000 -p $CA_ADO_TASK_ACR_ACCESS_TOKEN > /dev/null 2>&1"`);
        } catch (err) {
            toolHelper.writeError(`Failed to log in to ACR instance "${acrName}" with access token`)
            throw err;
        }
    }

    /**
     * Pushes an image to the ACR instance that was previously authenticated against.
     * @param imageToPush - the name of the image to push to ACR
     */
    public async pushImageToAcr(imageToPush: string) {
        toolHelper.writeDebug(`Attempting to push image "${imageToPush}" to ACR`);
        try {
            await util.execute(`docker push ${imageToPush}`);
        } catch (err) {
            toolHelper.writeError(`Failed to push image "${imageToPush}" to ACR. Error: ${err.message}`);
            throw err;
        }
    }
}