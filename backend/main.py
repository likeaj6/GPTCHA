from flask import Flask
import anthropic
import os

from dotenv import load_dotenv



app = Flask(__name__)

@app.route('/robocaller')
def robocaller(context=None):
    c = anthropic.Client(os.environ["ANTHROPIC_API_KEY"])
    response = c.completion(
        prompt=f"{anthropic.HUMAN_PROMPT} You are an actor in a play, with the role of a robo-caller. Please generate an example of a robo-call transcript. Return just the transcript and nothing else.{anthropic.AI_PROMPT}",
        stop_sequences=[anthropic.HUMAN_PROMPT],
        max_tokens_to_sample=200,
        model="claude-v1",
    )
    return response['completion']


@app.route('/guardian')
def guardian():
    return 'Hello, World!'

if __name__ == '__main__':
    load_dotenv()  # take environment variables from .env.
    app.run(debug=True)
