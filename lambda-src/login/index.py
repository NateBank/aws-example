''' This lambda simply presents a login link that kicks over to cognito '''

from os import environ


cognito_login_url = f"{environ['COGNITO_URL']}/login"
cognito_client_id = environ['COGNITO_CLIENT_ID']
execute_api_url = environ['EXECUTE_API_URL']

def entrypoint(event, context):
    print(f'Display a simple login link that starts the cognito flow...')

    body = {
        f''' 
        <html><a href="{cognito_login_url}/login?client_id=7{cognito_client_id}&response_type=token&scope=openid&redirect_uri={execute_api_url}/page1">LOGIN HERE</a></html>
        '''
    }

    return {
        "statusCode": 200,
        "body": body,
        "headers": {}
    }