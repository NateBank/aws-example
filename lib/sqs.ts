import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

// you'll need to make this file, and don't commit it anywheres...
import { PROJECT_NAME } from '../config/cdk-env-vars'

export class SqsStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const sqsDlqName = `${PROJECT_NAME}-${this.region}-dlq`

        const sqsDlqQueue = new Queue(this, 'SqsDlqQueue', {
            queueName: sqsDlqName,
            encryption: QueueEncryption.KMS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY // no need to leave this hanging around
        });
        
        const sqsDlqQueueArn = new StringParameter(this, 'SqsDlqQueueArn', {
            stringValue: sqsDlqQueue.queueArn
        })
    }
}