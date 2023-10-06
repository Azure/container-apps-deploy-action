# Azure Container Apps Build and Deploy

This action allows users to easily deploy their application source to an
[Azure Container App](https://azure.microsoft.com/en-us/services/container-apps/) in their GitHub workflow by either
providing a previously built image, a Dockerfile that an image can be built from, or using a builder to create a
runnable application image for the user.

If no Dockerfile is found or provided in the provided application source, the following steps are performed by this action:

- Uses the Oryx++ Builder to build the application source using [Oryx](https://github.com/microsoft/Oryx) to produce a
  runnable application image
- Pushes this runnable application image to the provided Container Registry
- Creates or updates a Container App based on this image

If a Dockerfile is found or discovered in the application source, the builder won't be used and the image will be built
with a call to `docker build` and the Container App will be created or updated based on this image.

If a previously built image has already been pushed to a Container Registry and is provided to this action, no application source is required and the image will be used when creating or updating the Container App.

A YAML configuration file can also be provided to modify specific properties on the Container App that is created or
updated; please see the section below on the `yamlConfigPath` argument.

## Data/Telemetry Collection Notice

By default, this GitHub Action collects the following pieces of data for Microsoft:
- The Container App build and deploy scenario targeted by the user
  - _i.e._, used the Oryx++ Builder, used a provided/found Dockerfile, or provided a previously built image
  - _Note_: the image name is _not_ collected
- The processing time of the GitHub Action, in milliseconds
- The result of the GitHub Action
  - _i.e._, succeeded or failed
- If the Oryx++ Builder is used, events and metrics relating to building the provided application using Oryx

If you want to disable data collection, please set the `disableTelemetry` argument to `true`.

## Prerequisites

Prior to running this action, a set of Azure resources and GitHub Actions are either required or optional depending on
the arguments provided to this action.

### Container Registry

A Container Registry must exist that the user is able to push container images to. This action will leverage the Container Registry to either push a built
runnable application image to and/or deploy a Container App from.

### Azure Container App environment

An [Azure Container App environment](https://docs.microsoft.com/en-us/azure/container-apps/environment) is recommended
to have been previously created by the user to improve the performance of the action. If no environment has been
created before, or if an environment cannot be found in the resource group that is being used to host the created
Container App, then an environment will be created by as a part of the `az containerapp up` command, which may take
additional time.

### `azure/login`

The [`azure/login`](https://github.com/marketplace/actions/azure-login) action is used to authenticate calls using the
Azure CLI, which is used in this action to call the
[`az containerapp up`](https://docs.microsoft.com/en-us/cli/azure/containerapp?view=azure-cli-latest#az-containerapp-up)
command. If `azure/login` is not called prior to this action being called in the GitHub workflow, the `azureCredentials`
argument can be used to provide the credentials needed to successfully call `azure/login`. These credentials are
recommended to be stored as a [GitHub secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets),
and can be provided to this action without their value being exposed.

The credentials used for the `azure/login` action must have Contributor access over one of the following sets of
permissions:

- The existing Container App if both the `resourceGroup` and `containerAppName` arguments are provided _and_ exist
- The existing resource group if only the `resourceGroup` argument is provided _and_ exists
- The user's subscription if the `resourceGroup` argument is not provided _or_ is provided but does not exist

More information about configuring the deployment credentials required for this GitHub Action can be found
[here](https://github.com/marketplace/actions/azure-login#configure-deployment-credentials).

### `docker/login-action`

The [`docker/login-action`](https://github.com/marketplace/actions/docker-login) action is used to authenticate calls
to the user's Container Registry, which will host the image that is then deployed to the Container App.
Currently, `docker/login-action` is called during every invocation of this action, so the user's Container Registry base URL is required, along with username and password credentials that are able to authenticate calls to this Container Registry. If the Container Registry is ACR, these credentials are able to be retrieved by
[creating a service principal](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal#create-a-service-principal)
and giving it proper permissions to the ACR resource.

### pack CLI

The [pack CLI](https://buildpacks.io/docs/tools/pack/) is maintained by the Cloud Native Buildpacks project and is used
by this action to create runnable application images for the user when the application source code is provided and no
additional Dockerfile is provided or found. A [builder](https://buildpacks.io/docs/concepts/components/builder/) was
created by Oryx to take in the application source code provided to this action and produce an image that could then be
pushed to an image registry and used within a Container App to build and run the application.

A stable version of the pack CLI is installed on the GitHub runner executing the task, and depending on the base OS of
this runner, different tools will be leverage to assist with the installation:
- On Windows runners:
  - `curl` will be used to pull down the `.zip` containing the `pack` executable
  - `7z` will be used to unzip the `.zip` and place the `pack` executable in a folder called "pack" created in the
  working directory of the action
  - The `.zip` will be removed from the runner and the path containing the executable will be added to the `PATH`
  environment variable for future use via `pack`
- On non-Windows runners:
  - `curl` will be used to pull down the `.tgz` containing the `pack` executable
  - `tar` will be used to unzip the `.tgz` and place the `pack` executable in `/usr/local/bin`

## Arguments

Below are the arguments that can be provided to the Azure Container Apps Build and Deploy GitHub Action.

_Note_: Although no argument is officially marked as "required" in the metadata of this actions, some arguments will
need to be provided in order for this action to successfully run using one of the two main scenarios.

### Arguments required for building and pushing application image

| Argument name             | Required | Description |
| ------------------------- | -------- | ----------- |
| `acrName` or `registryUrl`| Yes (for this scenario)| The name of the Azure Container Registry or the base URL of any other Container Registry that the runnable application image will be pushed to. |
| `appSourcePath`           | Yes (for this scenario) | Absolute path on the GitHub runner of the source application code to be built. |

### Arguments required for using an already pushed application image

| Argument name             | Required | Description |
| ------------------------- | -------- | ----------- |
| `imageToDeploy`           | Yes (for this scenario) | The name of the image that has already been pushed to a registry and will be deployed to the Container App by this action. If this image is found in an ACR instance that requires authentication to pull, the `acrName` argument, or the `acrUsername` and `acrPassword` arguments, can be provided to authenticate requests to the ACR instance. If the image is found in an other Container Registry that requires authentication to pull, the `registryUrl` argument, the `registryUsername` and `registryPassword` arguments, can be provided to authenticate requests to the Container Registry. |

### Arguments required for using a YAML configuration file

| Argument name             | Required | Description |
| ------------------------- | -------- | ----------- |
| `yamlConfigPath`          | Yes (for this scenario) | Full path (on the executing GitHub runner) to the YAML file detailing the configuration of the Container App. |

#### Important notes on the YAML configuration file

The `resourceGroup` property in the YAML configuration file _will not_ be used; the value for this either comes from
the `resourceGroup` argument provided to the action, or the default resource group name generated by the action. All
other properties provided in the YAML configuration file will override the values provided as arguments to this action;
for example, if the `containerAppName` argument is provided to the action, and the `name` property is set in the YAML
configuration file, the `name` property in the YAML file will be used when creating or updating the Container App.

Image and application source arguments (_e.g._, `appSourcePath`, `imageToDeploy`) will still be used to first build
and/or push an image that is used by the Container App; in this case, the provided YAML configuration file will need to
reference the image specified by `imageToDeploy` (or `imageToBuild`, depending on your scenario).

When creating a new Container App, all properties listed in the YAML configuration file (except `resourceGroup` as
mentioned above) will be set when the Container App is created. When updating an existing Container App, only the
properties listed in the file will be updated on the Container App.

Currently, the YAML file does not support setting up managed identity authentication for the Container Registry used;
for more information on this issue, please see
[this GitHub issue](https://github.com/microsoft/azure-container-apps/issues/524).

In cases where the `yamlConfigPath` argument is provided, the YAML file will be passed through to the corresponding
`az containerapp` command, either
[`create`](https://learn.microsoft.com/en-us/cli/azure/containerapp?view=azure-cli-latest#az-containerapp-create) or
[`update`](https://learn.microsoft.com/en-us/cli/azure/containerapp?view=azure-cli-latest#az-containerapp-update)
depending on your scenario. For more information on the intended behavior when the YAML configuration file is provided,
please see the documents linked for the corresponding commands.

For more information on the structure of the YAML configuration file, please visit [this site](https://aka.ms/azure-container-apps-yaml).


### Additional arguments

| Argument name             | Required | Description |
| ------------------------- | -------- | ----------- |
| `acrUsername`             | No       | The username used to authenticate push requests to the provided Azure Container Registry. If not provided, an access token will be generated via "az acr login" and provided to "docker login" to authenticate the requests. |
| `acrPassword`             | No       | The password used to authenticate push requests to the provided Azure Container Registry. If not provided, an access token will be generated via "az acr login" and provided to "docker login" to authenticate the requests. |
| `registryUsername`        | No       | The username used to authenticate push requests to the provided Container Registry using the "docker login" action. |
| `registryPassword`        | No       | The password used to authenticate push requests to the provided Container Registry using the "docker login" action. |
| `azureCredentials`        | No       | Azure credentials used by the `azure/login` action to authenticate Azure CLI requests if the user has not previously authenticated in the workflow calling this action. |
| `imageToBuild`            | No       | The custom name of the image that is to be built, pushed to the Container Registry and deployed to the Container App by this action. _Note_: this image name should include the registry server; _e.g._, `<registryUrl>/<repo>:<tag>`. If this argument is not provided, a default image name will be constructed in the form `<registryUrl>/github-action/container-app:<github-run-id>.<github-run-attempt>` |
| `dockerfilePath`          | No       | Relative path (_without file prefixes, see example below_) to the Dockerfile in the provided application source that should be used to build the image that is then pushed to the Container Registry and deployed to the Container App. If not provided, this action will check if there is a file named `Dockerfile` in the provided application source and use that to build the image. Otherwise, the Oryx++ Builder will be used to create the image. |
| `containerAppName`        | No       | The name of the Container App that will be created or updated. If not provided, this value will be `github-action-container-app-<github-run-id>-<github-run-attempt>`. |
| `resourceGroup`           | No       | The existing resource group that the Azure Container App will be created in. If not provided, this value will be `<container-app-name>-rg` and its existence will first be checked before attempting to create it. |
| `containerAppEnvironment` | No       | The name of the Container App environment to use with the application. If not provided, an existing environment in the resource group of the Container App will be used, otherwise, an environment will be created in the formation `<container-app-name>-env`. |
| `runtimeStack`            | No       | The platform version stack used in the final runnable application image that is deployed to the Container App. The value should be provided in the formation `<platform>:<version>`. If not provided, this value is determined by Oryx based on the contents of the provided application. Please refer to [this document](https://github.com/microsoft/Oryx/blob/main/doc/supportedRuntimeVersions.md) for more information on supported runtime stacks for Oryx. |
| `builderStack`            | No       | The stack (OS) that should be used to build the provided application source and produce the runnable application image. You can provide a specific image tag for the stack, such as "debian-bookworm-20231004.1", or you can provide a supported stack name, such as "debian-bookworm" or "debian-bullseye", and the latest supported image tag for that stack will be used. If no stack is provided, this action will attempt to build the provided application source with each supported stack until there's a successful build. |
| `targetPort`              | No       | The designated port for the application to run on. If no value is provided and the builder is used to build the runnable application image, the target port will be set to 80 for Python applications and 8080 for all other platform applications. If no value is provided when creating a Container App, the target port will default to 80. Note: when using this action to update a Container App, the target port may be updated if not provided based on changes to the ingress property. |
| `location`                | No       | The location that the Container App (and other created resources) will be deployed to. To view locations suitable for creating the Container App in, please run the following: `az provider show -n Microsoft.App --query "resourceTypes[?resourceType=='containerApps'].locations"` |
| `environmentVariables`    | No       | A list of environment variable(s) for the container. Space-separated values in 'key=value' format. Empty string to clear existing values. Prefix value with 'secretref:' to reference a secret. |
| `buildArguments`          | No       | A list of build argument(s) for the container. Space-separated values in 'key=value'.|
| `ingress`                 | No       | Possible options: external, internal, disabled. If set to "external" (default value if not provided when creating a Container App), the Container App will be visible from the internet or a VNET, depending on the app environment endpoint configured. If set to "internal", the Container App will be visible from within the app environment only. If set to "disabled", ingress will be disabled for this Container App and will not have an HTTP or TCP endpoint. |
| `disableTelemetry`        | No       | If set to `true`, no telemetry will be collected by this GitHub Action. If set to `false`, or if this argument is not provided, telemetry will be sent to Microsoft about the Container App build and deploy scenario targeted by this GitHub Action. |

## Usage

See [`action.yml`](./action.yml)

### Minimal - Build application image for Container App

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg`. The Container App will be based off of an image that was built from
the provided `appSourcePath` and pushed to the provided ACR instance. An access token will be generated to authenticate an access token will be generated to authenticate
the push to the provided ACR instance.

### Minimal - Use previously published image for Container App

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      imageToDeploy: mcr.microsoft.com/azuredocs/containerapps-helloworld:latest
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg` where **no new image is built**, but an existing image named
`mcr.microsoft.com/azuredocs/containerapps-helloworld:latest` will be used for the Container App.

### Minimal - Use YAML configuration file with previously published image for Container App

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      yamlConfigPath: simple-image-container-app.yaml
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group name `<container-app-name>-rg` where **no new image is built**, but an existing image named
`mcr.microsoft.com/azuredocs/containerapps-helloworld:latest` will be used for the Container App. Additional properties
about the Container App will be pulled from the `simple-image-container-app.yaml` file and will override any additional
values that would've been provided to the GitHub Action as arguments **excluding `resourceGroup`**.

The `simple-image-container-app.yaml` file has the following structure:

```yml
properties:
  managedEnvironmentId: /subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP/providers/Microsoft.App/managedEnvironments/CONTAINER_APP_ENVIRONMENT
  configuration:
    ingress:
      external: true
      allowInsecure: false
      targetPort: 80
  template:
    containers:
      - image: mcr.microsoft.com/azuredocs/containerapps-helloworld:latest
        name: mysampleimagecontainer
```

The values for `SUBSCRIPTION_ID`, `RESOURCE_GROUP` and `CONTAINER_APP_ENVIRONMENT` must be updated to point to the full
resource ID of the **existing** Container App environment that the Container App will use.

### Using ACR credentials to authenticate

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      acrUsername: ${{ secrets.REGISTRY_USERNAME }}
      acrPassword: ${{ secrets.REGISTRY_PASSWORD }}
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg`. The Container App will be based off of an image that was built from
the provided `appSourcePath` and pushed to the provided ACR instance. The provided ACR credentials will be used to
authenticate the calls to the ACR instance.

### Using Docker Hub credentials to authenticate

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      registryUrl: mytestregistry.dockerhub.io
      registryUsername: ${{ secrets.REGISTRY_USERNAME }}
      registryPassword: ${{ secrets.REGISTRY_PASSWORD }}
```
This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg`. The Container App will be based off of an image that was built from
the provided `appSourcePath` and pushed to the provided Container Registry instance. The provided Container Registry credentials will be used to
authenticate the calls to the Container Registry instance.

### Container App name provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      containerAppName: my-test-container-app
```

This will create a new Container App named `my-test-container-app` in a new resource group named
`my-test-container-app-rg`.

### Resource group provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      resourceGroup: my-test-rg
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `my-test-rg`.

### Container App name and resource group provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      containerAppName: my-test-container-app
      resourceGroup: my-test-rg
```

If the `my-test-rg` resource group does not exist, this will create the resource group and create a new Container App
named `my-test-container-app` within the resource group. If the resource group already exists, this will create a new
Container App named `my-test-container-app` in the resource group, or update the Container App if it already exists
within the resource group.

### Container App environment provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      containerAppEnvironment: my-test-container-app-env
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg` with a new Container App environment named `my-test-container-app-env`.

### Runtime stack provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      runtimeStack: 'dotnetcore:7.0'
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg` where the runnable application image is using the .NET 7 runtime stack.

### Dockerfile provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      dockerfilePath: test.Dockerfile
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg` where the runnable application image was created from the `test.Dockerfile`
file found in the provided application source path directory.

_Note_: for values provided to `dockerfilePath`, no file prefixes should be included (_e.g._, `./test.Dockerfile` should be
passed as just `test.Dockerfile`). The provided `appSourcePath` and `dockerfilePath` arguments will be concatenated inside
of the GitHub Action.

### Image to build provided

```yml
steps:

  - name: Log in to Azure
    uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Build and deploy Container App
    uses: azure/container-apps-deploy-action@v1
    with:
      appSourcePath: ${{ github.workspace }}
      acrName: mytestacr
      imageToBuild: mytestacr.azurecr.io/app:latest
```

This will create a new Container App named `github-action-container-app-<github-run-id>-<github-run-attempt>` in a new
resource group named `<container-app-name>-rg` where the image built and pushed to ACR is named `mytestacr.azurecr.io/app:latest`
## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
