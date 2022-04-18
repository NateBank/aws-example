''' This lambda simply presents a login link that kicks over to cognito '''

from os import environ


cognito_login_url = f"{environ['COGNITO_URL']}/login"

def entrypoint(event, context):
    print(f'Display a simple login link that starts the cognito flow...')

    body = {
        f''' 
        <html><a href="{cognito_login_url}">LOGIN HERE</a></html>
        '''
    }

    return {
        "statusCode": 200,
        "body": body,
        "headers": {}
    }