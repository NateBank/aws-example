''' This lambda receives post-authorization events from cognito and forwards them to eventbridge '''

import json
from os import environ
import boto3
from datetime import datetime

table_name = environ['EVENT_BUS_NAME']

events_client = boto3.client('events')

def entrypoint(event, context):
    print(event)
    ''' sadly post-auth only fires on a successful login, not super useful. a typical post-auth event looks like so: 
        {
            'version': '1', 
            'region': 'us-west-2', 
            'userPoolId': 'us-west-2_W9Upw0uK9', 
            'userName': 'obiwankenobi', 
            'callerContext': {
                'awsSdkVersion': 'aws-sdk-unknown-unknown',
                'clientId': '7konpabi6niifk71ioo2pcmm1v'}, 
                'triggerSource': 'PostAuthentication_Authentication', 
                'request': {
                    'userAttributes': {
                        'sub': '1bcb3f00-a5c5-4743-8397-7793bf2a8f27', 
                        'cognito:user_status': 'CONFIRMED', 
                        'email_verified': 'true', 
                        'email': 'nathaniel.bank+obiwan@gmail.com'
                    }, 
                    'newDeviceUsed': False
                }, 
            'response': {}
        }
    '''

    try:
        print('Sending results of login attempt to EventBridge for further processing...')

    except Exception as e:
        print(e)

    # Cognito post-authorization hook wants to see the event as the response, for reasons
    return event