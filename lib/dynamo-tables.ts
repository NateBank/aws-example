import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, BillingMode, TableEncryption, AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

// you'll need to make this file, and don't commit it anywheres...
import { PROJECT_NAME } from '../config/cdk-env-vars'

export class DynamoStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const accessLogTable = new Table(this, 'AccessLogTable', {
            tableName: `${PROJECT_NAME}-access`,
            // obv in prod we don't like destroying tables but for dev/demo it's a pain in the arse
            // to import tables cuz CFn will take any old table definition as long as the name is right
            // which is really stupid because when you go to fix discrepencies it often doesn't see a change
            // or worse it totally borks your table and then you get to destroy the stack and start over.
            // fun.
            // for this exercise, nuking is way easier:
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
            encryption: TableEncryption.AWS_MANAGED,
            partitionKey: {
                name: 'pk',
                type: AttributeType.STRING
            },
            // @TODO add replicationRegions when going multi-region
            // replicationRegions: ['us-east-2']
        })

    }
}