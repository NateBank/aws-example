''' This simple lambda displays an image to the user, which they can click on to get to the next page
    It sends info about the interaction to eventbridge which forwards it on to dynamodb '''

import json
from os import environ
import boto3

# initialize these outside the main function so warm lambdas don't have to do it again
s3_client = boto3.client('s3')
events_client = boto3.client('events')
execute_api = environ['EXECUTE_API_URL']

def entrypoint(event, context):
    print(event)

    # wrap everything in a try/catch to prevent lambda "helping" try to resolve things
    try:
        # send an event to Dynamo to increment page view counter tracker
        events_client.put_event()

        bucket = environ['S3_BUCKET_NAME']

        kenobi_gif = s3_client.get_object(Bucket=bucket, Key='hellothere.gif')

        body = {f'''
    Hello There!  Click the image to go to page 2...
            '''
        } # change this to the image above, and add the link
        headers = {}

        return {
            "statusCode": 200,
            "body": json.dumps(body, indent=4),
            "headers": headers
        }

    except Exception as e:
        print(e)
        return {
            "statusCode": 503,
            "body": json.dumps({'error': 'An error occurred in the page1 lambda!'}),
            "headers": {}
        }