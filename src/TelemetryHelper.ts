import * as core from '@actions/core';
import { Utility } from './Utility';
import * as io from '@actions/io';

const ORYX_CLI_IMAGE: string = "mcr.microsoft.com/oryx/cli:debian-buster-20230207.2";

const SUCCESSFUL_RESULT: string = "succeeded";
const FAILED_RESULT: string = "failed";

const BUILDER_SCENARIO: string = "used-builder";
const DOCKERFILE_SCENARIO: string = "used-dockerfile";
const IMAGE_SCENARIO: string = "used-image";

const util = new Utility();

export class TelemetryHelper {
    readonly disableTelemetry: boolean;

    private scenario: string;
    private result: string;
    private errorMessage: string;
    private taskStartMilliseconds: number;

    constructor(disableTelemetry: boolean) {
        this.disableTelemetry = disableTelemetry;
        this.taskStartMilliseconds = Date.now();
    }

    /**
     * Marks that the task was successful in telemetry.
     */
    public setSuccessfulResult() {
        this.result = SUCCESSFUL_RESULT;
    }

    /**
     * Marks that the task failed in telemetry.
     */
    public setFailedResult(errorMessage: string) {
        this.result = FAILED_RESULT;
        this.errorMessage = errorMessage;
    }

    /**
     * Marks that the task used the builder scenario.
     */
    public setBuilderScenario() {
        this.scenario = BUILDER_SCENARIO;
    }

    /**
     * Marks that the task used the Dockerfile scenario.
     */
    public setDockerfileScenario() {
        this.scenario = DOCKERFILE_SCENARIO;
    }

    /**
     * Marks that the task used the previously built image scenario.
     */
    public setImageScenario() {
        this.scenario = IMAGE_SCENARIO;
    }

    /**
     * If telemetry is enabled, uses the "oryx telemetry" command to log metadata about this task execution.
     */
    public async sendLogs() {
        const taskLengthMilliseconds: number = Date.now() - this.taskStartMilliseconds;
        if (!this.disableTelemetry) {
            core.info(`Telemetry enabled; logging metadata about task result, length and scenario targeted.`);
            try {
                let resultArg: string = '';
                if (!util.isNullOrEmpty(this.result)) {
                    resultArg = `--property 'result=${this.result}'`;
                }

                let scenarioArg: string = '';
                if (!util.isNullOrEmpty(this.scenario)) {
                    scenarioArg = `--property 'scenario=${this.scenario}'`;
                }

                let errorMessageArg: string = '';
                if (!util.isNullOrEmpty(this.errorMessage)) {
                    errorMessageArg = `--property 'errorMessage=${this.errorMessage}'`;
                }

                let args: string[] = [`run`, `--rm`, `${ORYX_CLI_IMAGE}`, `/bin/bash`, `-c`, `oryx telemetry --event-name 'ContainerAppsGitHubActionV1' ` + `--processing-time '${taskLengthMilliseconds}' ${resultArg} ${scenarioArg} ${errorMessageArg}"`];

                await executeDockerCommand(args, true)
            } catch (err) {
                core.warning(`Skipping telemetry logging due to the following exception: ${err.message}`);
            }
        }
    }
}

const executeDockerCommand = async (args: string[], continueOnError: boolean = false): Promise<void> => {
    try {
        const dockerTool: string = await io.which("docker", true);
        await new Utility().executeAndthrowIfError(dockerTool, args, continueOnError);
    }
    catch (err) {
        core.setFailed(`Error: ${err.message}`);
        throw err; // Re-throw the error
    }
}