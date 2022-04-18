#!/usr/bin/env node

import 'source-map-support/register';
import { App } from 'aws-cdk-lib';

// you'll need to make this file, and don't commit it anywheres...
import { AWS_ACCOUNT_ID, PRIMARY_REGION } from '../config/cdk-env-vars'

import { ApiGatewayStack } from '../lib/apigateways'
import { DynamoStack } from '../lib/dynamo-tables'
import { EventBridgeStack } from '../lib/eventbridge'
import { LambdaStack } from '../lib/lambdas'
import { S3BucketStack } from '../lib/s3-buckets'
import { CloudWatchStack } from '../lib/cloudwatch-dash'

const accountId = process?.env?.AWS_ACCOUNT_ID !== undefined ? process?.env?.AWS_ACCOUNT_ID : AWS_ACCOUNT_ID;
const region = process?.env?.AWS_REGION !== undefined ? process?.env?.AWS_REGION : PRIMARY_REGION


const app = new App()

const lambdaStack = new LambdaStack(app, 'LambdaStack', { env: { account: accountId, region: region } })

const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', { env: { account: accountId, region: region } })
// we need the lambdas to be there before apig can reference them
apiGatewayStack.addDependency(lambdaStack)

if (region === PRIMARY_REGION) {
    // with global tables configured this only needs to be deployed in one region
    // the rest of the regions go in the table's "replicationRegions" array
    const dynamoStack = new DynamoStack(app, 'DynamoStack', { env: { account: accountId, region: region } })
}

const s3BucketStack = new S3BucketStack(app, 'S3BucketStack', { env: { account: accountId, region: region } })

const eventBridgeStack = new EventBridgeStack(app, 'EventBridgeStack', { env: { account: accountId, region: region } })
// we need to be able to target lambdas
eventBridgeStack.addDependency(lambdaStack)

const cloudWatchStack = new CloudWatchStack(app, 'CloudWatchStack', { env: { account: accountId, region: region } })
cloudWatchStack.addDependency(lambdaStack)
cloudWatchStack.addDependency(apiGatewayStack)
// this will need more addDependency for every stack we want to monitor, maybe add Dynamo next?
