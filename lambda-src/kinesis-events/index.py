''' This lambda watches the kinesis stream, takes the current page view count,
    and writes it to S3 so that the image lambda can display it '''

    
import boto3

s3_client = boto3.client('s3')

def entrypoint(event, context):
    print(event)

    print(f'Sending page view count to S3...')