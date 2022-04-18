import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CloudWatchStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // set up an alarm for too many failed login attempts, this may need to be a custom metric?
        // can this be tied into the built-in cognito pages or does that need to be hand-rolled to get the metrics...

        // set up dashboards for:
        // lambda cold start times
        // lambda execution times
        // lambda failures
        // failed logins hopefully
        // apig 4xx
        // apig 5xx
        // apig count
        // apig latency

    }
}