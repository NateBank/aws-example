import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda'
import { UserPool, UserPoolClient, UserPoolClientIdentityProvider, Mfa, OAuthScope } from 'aws-cdk-lib/aws-cognito'
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration  } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

import { COGNITO_DOMAIN_NAME } from '../config/cdk-env-vars'

export class ApiGatewayStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // pull in Lambda ARNs we want routes for
        const authEventLambda = Function.fromFunctionArn(
            this, 'AuthEventsLambda', StringParameter.valueForStringParameter(this, 'authEventsLambdaArn')
        )
        const loginLambda = Function.fromFunctionArn(
            this, 'LoginLambda', StringParameter.valueForStringParameter(this, 'loginLambdaArn')
        )
        const logoutLambda = Function.fromFunctionArn(
            this, 'LogoutLambda', StringParameter.valueForStringParameter(this, 'logoutLambdaArn')
        )
        const page1Lambda = Function.fromFunctionArn(
            this, 'Page1Lambda', StringParameter.valueForStringParameter(this, 'page1LambdaArn')
        )
        const page2Lambda = Function.fromFunctionArn(
            this, 'Page2Lambda', StringParameter.valueForStringParameter(this, 'page2LambdaArn')
        )

// @TODO figure out how to throttle the API, why doesn't HTTP API expose this still....
// the console has moved throttling to its own thing that seems to be configured per stage

// @TODO SET EXPIRATION ON THIS
        const apigLogs = new LogGroup(this, 'ApigLogs', {
            logGroupName: 'apigLogs',
        })
        
        new StringParameter(this, 'ApigLogsArn', {
            parameterName: 'ApigLogsArn', stringValue: apigLogs.logGroupArn
        })

// @TODO turn off autodeploy and handle it in code
        // set up the API first so we can get its execute endpoint hopefully
        const api = new HttpApi(this, 'HttpApi');
        const executeUrl = api.apiEndpoint

        const deadpool = new UserPool(this, 'Deadpool', {
            removalPolicy: RemovalPolicy.DESTROY, // for demos, let's keep this clean
            userPoolName: 'Deadpool',
            signInAliases: {
                username: true
            },
            mfa: Mfa.OPTIONAL,
            mfaSecondFactor: {
                sms: true,
                otp: true,
            },
            lambdaTriggers: {
                verifyAuthChallengeResponse: authEventLambda  // let's see what it has to report
            }
        })

        // this creates a clientId but no clientSecret
        const userPoolClient = new UserPoolClient(this, 'userpool-client', {
            userPool: deadpool,
            authFlows: {
                adminUserPassword: true,
                userPassword: true,
                custom: true,
                userSrp: true,
            },
            supportedIdentityProviders: [
                UserPoolClientIdentityProvider.COGNITO,
            ],
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [ OAuthScope.OPENID ],
                callbackUrls: [ `${executeUrl}/page1` ],
                logoutUrls: [ `${executeUrl}/login` ],
            }
        });

        // this has to be globally unique across all of AWS, be clever!
        deadpool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: COGNITO_DOMAIN_NAME,
            },
        });

        const cognitoAuthorizer = new HttpUserPoolAuthorizer('CognitoAuthorizer', deadpool, {
            userPoolClients: [userPoolClient],
            identitySource: ['$request.header.Authorization'],
        });

        // provides the login button that launches the cognito flow
        api.addRoutes({
            integration: new HttpLambdaIntegration('LoginIntegration', loginLambda),
            path: '/login',
            methods: [HttpMethod.GET, HttpMethod.OPTIONS]
        });

        api.addRoutes({
            integration: new HttpLambdaIntegration('LogoutIntegration', logoutLambda),
            path: '/logout',
            authorizer: cognitoAuthorizer,
            methods: [HttpMethod.GET, HttpMethod.OPTIONS]
        });

        api.addRoutes({
            integration: new HttpLambdaIntegration('Page1Integration', page1Lambda),
            path: '/page1',
            authorizer: cognitoAuthorizer,
            methods: [HttpMethod.GET, HttpMethod.OPTIONS]
        });

        api.addRoutes({
            integration: new HttpLambdaIntegration('Page2Integration', page2Lambda),
            path: '/page2',
            authorizer: cognitoAuthorizer,
            methods: [HttpMethod.GET, HttpMethod.OPTIONS]
        });

    }
}