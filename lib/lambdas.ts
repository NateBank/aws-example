import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

import { PROJECT_NAME } from '../config/cdk-env-vars'
import { COMMON_LAMBDA_ENV } from '../config/lambda-env-vars'
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // @TODO make the policies/roles more lambda-specific

        const lambdaPolicy = new ManagedPolicy(this, 'LambdaPolicy', {
            managedPolicyName: 'DemoLambdaPolicy',
            statements: [
                new PolicyStatement({
                    sid: "AllowS3GetAccess",
                    effect: Effect.ALLOW,
                    actions: [
                        "s3:Get*", "s3:List*"
                    ],
                    resources: ["*"]
                })
            ]
        })

        const lambdaRole = new Role(this, 'LambdaRole', {
            roleName: 'DemoLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [lambdaPolicy]
        })
        lambdaRole.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
        )

        const authEventsLambda = new PythonFunction(this, 'AuthEventsLambda', {
            functionName: `${PROJECT_NAME}-AuthEvents`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: {...COMMON_LAMBDA_ENV['us-west-2'], EVENT_BUS_NAME: 'appBus'},
            entry: './lambda-src/auth-events',
            handler: 'entrypoint',
        })
        new StringParameter(this, 'AuthEventLambdaParam', {
            parameterName: 'authEventsLambdaArn', stringValue: authEventsLambda.functionArn
        })
        // allow cognito to invoke this post-auth event
        authEventsLambda.grantInvoke(new ServicePrincipal('cognito-idp.amazonaws.com'))

        const cloudwatchAlarmsLambda = new PythonFunction(this, 'CloudwatchAlarmsLambda', {
            functionName: `${PROJECT_NAME}-CloudwatchAlarms`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            entry: './lambda-src/cloudwatch-alarms',
            handler: 'entrypoint',
        })
        new StringParameter(this, 'CloudwatchAlarmsLambdaParam', {
            parameterName: 'cloudwatchAlarmsLambdaArn', stringValue: cloudwatchAlarmsLambda.functionArn
        })

        const deleteUserLambda = new PythonFunction(this, 'DeleteUserLambda', {
            functionName: `${PROJECT_NAME}-DeleteUser`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            entry: './lambda-src/delete-user',
            handler: 'entrypoint',
        })
        new StringParameter(this, 'DeleteUserLambdaParam', {
            parameterName: 'deleteUserLambdaArn', stringValue: deleteUserLambda.functionArn
        })

        const dlqHandlerLambda = new PythonFunction(this, 'DlqHandlerLambda', {
            functionName: `${PROJECT_NAME}-DlqHandler`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
           entry: './lambda-src/dlq-handler'
        })
        new StringParameter(this, 'DlqHandlerLambdaParam', {
            parameterName: 'dlqHandlerLambdaArn', stringValue: dlqHandlerLambda.functionArn
        })

        const dynamoEventsLambda = new PythonFunction(this, 'DynamoEventsLambda', {
            functionName: `${PROJECT_NAME}-DynamoEvents`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
           entry: './lambda-src/dynamo-events'
        })
        new StringParameter(this, 'DynamoEventsLambdaParam', {
            parameterName: 'dynamoEventsLambdaArn', stringValue: dynamoEventsLambda.functionArn
        })

        const eventsRouterLambda = new PythonFunction(this, 'EventsRouterLambda', {
            functionName: `${PROJECT_NAME}-EventsRouter`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: {...COMMON_LAMBDA_ENV['us-west-2'], DDB_TABLE_NAME: `${PROJECT_NAME}-access`},
            handler: 'entrypoint',
           entry: './lambda-src/events-router'
        })
        new StringParameter(this, 'EventsRouterLambdaParam', {
            parameterName: 'eventsRouterLambdaArn', stringValue: eventsRouterLambda.functionArn
        })

        const kinesisEventsLambda = new PythonFunction(this, 'KinesisEventsLambda', {
            functionName: `${PROJECT_NAME}-KinesisEvents`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
           entry: './lambda-src/kinesis-events'
        })
        new StringParameter(this, 'KinesisEventsLambdaParam', {
            parameterName: 'kinesisEventsLambdaArn', stringValue: kinesisEventsLambda.functionArn
        })
        
        const loginLambda = new PythonFunction(this, 'LoginLambda', {
            functionName: `${PROJECT_NAME}-Login`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            entry: './lambda-src/login',
            handler: 'entrypoint',
        })
        new StringParameter(this, 'LoginLambdaParam', {
            parameterName: 'loginLambdaArn', stringValue: loginLambda.functionArn
        })
        
        const logoutLambda = new PythonFunction(this, 'LogoutLambda', {
            functionName: `${PROJECT_NAME}-Logout`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
            entry: './lambda-src/logout'
        })
        new StringParameter(this, 'LogoutLambdaParam', {
            parameterName: 'logoutLambdaArn', stringValue: logoutLambda.functionArn
        })

        const page1Lambda = new PythonFunction(this, 'Page1Lambda', {
            functionName: `${PROJECT_NAME}-Page1`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
           entry: './lambda-src/page1'
        })
        new StringParameter(this, 'Page1LambdaParam', {
            parameterName: 'page1LambdaArn', stringValue: page1Lambda.functionArn
        })

        const page2Lambda = new PythonFunction(this, 'Page2Lambda', {
            functionName: `${PROJECT_NAME}-Page2`,
            role: lambdaRole,
            runtime: Runtime.PYTHON_3_9,
            environment: COMMON_LAMBDA_ENV['us-west-2'],
            handler: 'entrypoint',
           entry: './lambda-src/page2'
        })
        new StringParameter(this, 'Page2LambdaParam', {
            parameterName: 'page2LambdaArn', stringValue: page2Lambda.functionArn
        })
        
    }
}