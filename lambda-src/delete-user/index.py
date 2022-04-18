''' This lambda will destroy the logged-in user, honoring their right to be forgotten '''

import boto3

cognito_client = boto3.client('cognito-idp')

def entrypoint(event, context):
    print(event)

    username = event['username']

    try:
        print(f'Deleting user {username}...')
        cognito_client.delete_user()

        print(f'Removing {username} device...')
        cognito_client.forget_device()

        print(f'Send message to slack that user {username} was deleted...')
    except Exception as e:
        print(e)