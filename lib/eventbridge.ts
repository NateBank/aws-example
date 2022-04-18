import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EventBus } from 'aws-cdk-lib/aws-events'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

// you'll need to make this file, and don't commit it anywheres...
import { PROJECT_NAME } from '../config/cdk-env-vars'


export class EventBridgeStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const lambdaBus = new EventBus(this, 'LambdaBus', {
            eventBusName: 'appBus'
        })

        // set up rules

    }
}