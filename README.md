This sets up a basic serverless app in AWS using the CDK v2.  The CDK code is TypeScript using Node 16 LTS, the application code is Python 3.9.  The app is encrypted end to end and at rest using TLS 1.2 for the APIs and AWS SSE on the back end.  It's protected by a Cognito authorizor.  It's active-active in two (potentially more) regions.  It has a Slack integration that has commands to force failure of one region.  It's coded to randomly break every now and then to demonstrate custom error handling and monitoring.  It's designed to minimize lambda cold start times and scale very quickly, but is also throttled heavily to make sure it doesn't get abused.

It consists of:
- an S3 bucket to hold static content
- a DynamoDB table to keep track of logins and page views
- a Cognito user pool to manage logins
- an API Gateway authorizer hooked up to the Cognito pool
- an API Gateway HTTP API that serves up user requests from backing Lambdas
- an API Gateway HTTP API that receives events from Slack
- a CloudWatch alarm that triggers when failed login attempts exceed a threshold and invokes a lambda 
- a custom 404 response page
- an EventBridge bus that takes data from the user-facing Lambda requests and sends them to a Lambda that handles DynamoDB updates
- an SQS dead letter queue for events that don't get picked up correctly
- a Lambda to handle messages that show up in the DLQ
- a Kinesis stream hooked up to the DynamoDB stream that writes update info to S3
- a CloudWatch dashboard showing metrics for Lambda invocations, errors, dead letter message counts

The basic flow is:
- user logs in, the attempt is logged to Dynamo
- user is presented with an image Lambda pulls from S3 and a "hello from {relevant region}" message
- clicking the image will usually cause the backing Lambda to send a message on the bus which will write the event to Dynamo, and send back another image indicating an interaction occurred and a "page viewed X times" message
- randomly clicking the image will throw an exception in the Lambda, an error image will be presented instead, and the user will be given a retry option which unless the random number generator is suspiciously consistent should result in the previous step's image being displayed
- when error rates hit a threshold a message is sent to Slack

Note that when you tear down this app you will have to purge and destroy S3 buckets manually and delete any lingering cloudwatch logs because AWS.

Note that this doesn't use any CFn exports, only SSM parameters.  This keeps the stacks loosely coupled in case one needs to be changed in a way that would impact another stack; tearing down a bunch of stacks just to tweak the name of something is downtime nobody needs.

