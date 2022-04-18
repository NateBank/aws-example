''' This lambda picks up events from EventBridge and sends them to various places '''

import json
from os import environ
from datetime import datetime
import boto3

table_name = environ['DDB_TABLE_NAME']
ddb_client = boto3.client('dynamodb')

def entrypoint(event, context):
    print(event)
    
    if 'something_naughty' in event and event['something_naughty'] == "bad_login":
        print(f'Sending bad login message to Slack...')

    try:
        print(f'Putting login info into DynamoDB...')
        ddb_put = ddb_client.put_item(
            TableName=table_name,
            Item={
                'user_id': {
                    'S': 'id-of-user'
                },
                'event': {
                    'S': json.dumps(event)
                },
                'context': {
                    'S': str(vars(context))
                },
                'context_identity': {
                    'S': str(dir(context.identity))
                },
                'insert_time': {
                    'S': str(datetime.now())
                }
            })
    
    except Exception as e:
        print(e)