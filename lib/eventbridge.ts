import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Function } from 'aws-cdk-lib/aws-lambda'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

// you'll need to make this file, and don't commit it anywheres...
import { PROJECT_NAME } from '../config/cdk-env-vars'


export class EventBridgeStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const eventsRouterLambda = Function.fromFunctionArn(
            this, 'EventsRouterLambda', StringParameter.valueForStringParameter(this, 'eventsRouterLambdaArn')
        )

        const lambdaBus = new EventBus(this, 'LambdaBus', {
            eventBusName: 'appBus'
        })

        const lambdaRule = new Rule(this, 'LambdaRule', {
            eventPattern: {
                source: ["manualEvents"], // can I just make this up if I don't want an AWS service?
            },
        });

        const sqsDlqName = `${PROJECT_NAME}-${this.region}-events-dlq`

        const sqsDlqQueue = new Queue(this, 'SqsDlqQueue', {
            queueName: sqsDlqName,
            encryption: QueueEncryption.KMS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY // no need to leave this hanging around
        });
        
        const sqsDlqQueueArn = new StringParameter(this, 'SqsDlqQueueArn', {
            parameterName: 'eventsDlqArn',
            stringValue: sqsDlqQueue.queueArn
        })

        // this is throwing a weird error... You need to provide a concrete account for the target stack when using cross-account or cross-region events
        // lambdaRule.addTarget(new LambdaFunction(eventsRouterLambda, {
        //     deadLetterQueue: sqsDlqQueue,
        //     maxEventAge: Duration.hours(2),
        //     retryAttempts: 2
        // }));


        // make sure we don't lose events
        lambdaBus.archive('LambdaBusArchive', {
            archiveName: 'LambdaBusArchive',
            description: 'Archive for the Lambda bus',
            eventPattern: {
                account: [Stack.of(this).account],
            },
            retention: Duration.days(14),
        });
    }
}