''' This lambda may not be necessary? something has to handle cognito logouts,
    this should be a simple lambda if it needs to exist '''

import boto3

cognito_client = boto3.client('cognito-idp')

def entrypoint(event, context):
    print(event)
