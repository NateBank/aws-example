import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Dashboard, Metric, GraphWidget, Color } from 'aws-cdk-lib/aws-cloudwatch'
import { Function } from 'aws-cdk-lib/aws-lambda'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

export class CloudWatchStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // set up an alarm for too many failed login attempts, this looks like it needs to be a custom metric??
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



        // pull in Lambda ARNs we want to graph metrics for
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


        const lambdaDash = new Dashboard(this, 'LambdaDash', {
            dashboardName: 'Page1LambdaDash'
        })

        lambdaDash.addWidgets(new GraphWidget({
          title: "Page 1 Lambda executions vs error rate",
        
          left: [page1Lambda.metricInvocations()],
        
          right: [page1Lambda.metricErrors().with({
            statistic: "average",
            label: "Error rate",
            color: Color.GREEN,
          })]
        }));

    }
}