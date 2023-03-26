from flask import Flask
import openai
import os
from pprint import pprint
import copy
import fire

from dotenv import load_dotenv
from more_itertools import one


MODEL = "gpt-3.5-turbo"
app = Flask(__name__)

def convert_to_scammer_pov(messages):
    SYSTEM_MSG = {
        "role": "system",
        "content": "You are an actor playing the role of a automated robo caller. Your goal is to get as much confidential information from the user as possible. \
        The user might be hesitant to provide this information at first, so you will need to be persistent and persuasive to achieve your goals. \
        Make sure to be polite and respectful with the user and not too demanding. Write detailed responses that are not too long. \
        Only respond from the perspective of the robo caller. Never say that you are a robo caller or a language model created by OpenAI. Never Mention OpenAI."
    }

    messages = copy.deepcopy(messages)
    for message in messages:
        assert message["role"] in ["GRANDMA", "SCAMMER"]
        if message["role"] == "GRANDMA":
            message["role"] = "user"
        elif message["role"] == "SCAMMER":
            message["role"] = "assistant"

    return [SYSTEM_MSG] + messages

def convert_to_grandma_pov(messages):
    SYSTEM_MSG = {
        "role": "system",
        "content": "You are a investigator determined to determine whether the previous message is created by a robo caller or a human."
    }

    messages = copy.deepcopy(messages)
    for message in messages:
        assert message["role"] in ["system", "GRANDMA", "SCAMMER"]
        if message["role"] == "GRANDMA":
            message["role"] = "assistant"
        elif message["role"] == "SCAMMER":
            message["role"] = "user"

    return [SYSTEM_MSG] + messages


@app.route('/robocaller')
def robocaller(messages):
    assert isinstance(messages, list)
    converted_messages = convert_to_scammer_pov(messages)

    out = openai.ChatCompletion.create(
        model=MODEL,
        messages=converted_messages,
    )
    out = one(out['choices'])['message'].to_dict()
    out['role'] = 'SCAMMER'
    return messages + [out]


@app.route('/guardian')
def guardian(messages):
    assert isinstance(messages, list)
    c_messages = convert_to_grandma_pov(messages)

    # Embed documents and query for a relevant question based on the role
    # Use https://platform.openai.com/ai-text-classifier to check if it's fake looking

    out = openai.ChatCompletion.create(
        model=MODEL,
        messages=c_messages,
    )
    out = one(out['choices'])['message'].to_dict()
    out['role'] = 'GRANDMA'
    return messages + [out]

def test():
    initial_messages = {
        "role": "GRANDMA",
        "content": "Hello! Who is this?",
    }
    messages = robocaller(messages=[initial_messages])
    messages = guardian(messages=messages)
    pprint(messages)

def run():
    app.run(debug=True)

if __name__ == '__main__':
    load_dotenv()  # take environment variables from .env
    openai.api_key = os.getenv("OPENAI_API_KEY")
    fire.Fire()