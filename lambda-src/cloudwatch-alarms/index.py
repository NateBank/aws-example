''' This lambda receives cloudwatch alarms and forwards the relevant info to Slack '''

def entrypoint(event, context):
    print(event)

    try:
        print(f'Forwarding unhappy news to Slack...')

        
    except Exception as e:
        print(e)