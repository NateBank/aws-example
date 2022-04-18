import json
from os import environ
import boto3

# initialize these outside the main function so warm lambdas don't have to do it again
s3_client = boto3.client('s3')
events_client = boto3.client('events')
execute_api = environ['EXECUTE_API_URL']

def entrypoint(event, context):
    print(event)

    bucket = environ['S3_BUCKET_NAME']
    print(f'Grabbing current page view counter from {bucket}...')

    page_count = s3_client.get_object(Bucket=bucket, Key='page_counter.txt')['Body']

    grievous_gif = s3_client.get_object(Bucket=bucket, Key='generalkenobi.gif')

    status = 200
    body = {f'''
    You are a bold one!  Accessing the site {page_count} times...
        '''
    } # change this to the image above plus the text
    headers = {}

    return {
        "statusCode": status,
        "body": json.dumps(body, indent=4),
        "headers": headers
    }