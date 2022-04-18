''' This lambda handles events coming from the dynamo stream '''

import boto3

kinesis_client = boto3.client('kinesis')

def entrypoint(event, context):
    print(event)

    print(f'Sending dynamo event to Kinesis...')

    # write the relevant info from the stream event to kinesis 
    # which will write the current page view counter to an S3 file

