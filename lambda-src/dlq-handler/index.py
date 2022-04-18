''' This lambda monitors the DLQ for events and does nifty things with whatever it finds '''

def entrypoint(event, context):
    print(event)

    print(f'Processing dead event...')