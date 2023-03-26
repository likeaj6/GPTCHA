import re
from datetime import date
from flask import Flask, request, session
from flask_cors import CORS
import openai
import os
from pprint import pprint
import fire

from dotenv import load_dotenv
from more_itertools import one
from dataclasses import dataclass


MODEL = "gpt-3.5-turbo"
app = Flask(__name__)
app.secret_key = 'daniel_secret'
CORS(app)


def convert_to_scammer_pov(messages):
    assert isinstance(messages, list), type(messages)
    SYSTEM_MSG = {
        "role": "system",
        "content": "You are an actor playing the role of a con artist. Your goal is to get as much confidential information from the user as possible. \
            The user might be hesitant to provide this information at first, so you will need to be persistent and persuasive to achieve your goals. \
            Make sure to be polite and respectful with the user and not too demanding. Write very short messages, 2 sentences max. \
            Only respond from the perspective of the con artist. Never say that you are a con artist or a language model created by OpenAI. Never Mention OpenAI."
    }

    msgs_for_openai = []
    for message in messages:
        role = {
            'outgoing': 'assistant',
            'incoming': 'user'
        }
        msgs_for_openai.append({
            'role': role[message['direction']],
            'content': message['text']
        })

    return [SYSTEM_MSG] + msgs_for_openai

def convert_to_grandma_pov(messages):
    assert isinstance(messages, list), type(messages)
    SYSTEM_MSG = {
        "role": "system",
        "content": "You are a investigator determining whether the previous message is created by a robo caller or a human. \
            Have a conversation pretending to be a human named Daniel, and try to determine whether the previous message is created by a robo caller or a human. \
            Before each response, output in parantheses if you think the caller is a robocaller, and why. After the parantheses, \
            continue the conversation as a normal convincing human. Be very helpful and friendly. Never mention openai or robocaller outside of parantheses. \
            It is extremely important that you output parantheses before each response. Respond as Daniel"
    }

    msgs_for_openai = []
    for message in messages:
        role = {
            'outgoing': 'user',
            'incoming': 'assistant'
        }
        msgs_for_openai.append({
            'role': role[message['direction']],
            'content': message['text']
        })

    return [SYSTEM_MSG] + msgs_for_openai


@app.route('/robocaller', methods=['POST'])
def robocaller(messages=None):
    try:
        messages = request.get_json()['messages']
    except Exception:
        pass

    converted_messages = convert_to_scammer_pov(messages)

    out = openai.ChatCompletion.create(
        model=MODEL,
        messages=converted_messages,
    )
    out = one(out['choices'])['message'].to_dict()
    out = {
        'timestamp': date.today().strftime('%Y-%m-%d'),
        'text': out['content'],
        'uid': "robo-caller",
        'photo': "https://github.com/likeaj6/GPTCHA/blob/main/src/assets/robot.jpeg?raw=true",
        'email': "",
        'direction': "incoming",
        'displayName': "Robot Caller",
    }
    return {'messages': messages + [out]}


@app.route('/guardian', methods=['POST'])
def guardian(messages=None):
    print(f'CURRENT THOUGHTS ARE {session.get("thoughts", [])}')
    try:
        messages = request.get_json()['messages']
    except Exception:
        pass

    # Embed documents and query for a relevant question based on the role
    # Use https://platform.openai.com/ai-text-classifier to check if it's fake looking

    if messages:
        c_messages = convert_to_grandma_pov(messages)
        out = openai.ChatCompletion.create(
            model=MODEL,
            messages=c_messages,
        )
        out = one(out['choices'])['message'].to_dict()

        thoughts = []
        def replace(match):
            thoughts.append(match.group(1))
            return ''
        out['content'] = re.sub(r'\((.*?)\)', replace, out['content']).strip()
        thoughts = ' '.join(thoughts)
        old_thoughts = session.get('thoughts', [])
        session['thoughts'] = old_thoughts + [thoughts]
    else:
        out = {'content': 'Hello! Who is this?'}

    out = {
        'timestamp': date.today().strftime('%Y-%m-%d'),
        'text': out['content'],
        'uid': "gptcha",
        'photo': "https://seeklogo.com/images/C/chatgpt-logo-02AFA704B5-seeklogo.com.png",
        'email': "",
        'direction': "outgoing",
        'displayName': "GPTCha",
    }
    return {'messages': messages + [out], 'thoughts': session.get('thoughts', [])}


@app.route('/')
def home():
    return 'Hello Grandma!'


def test():
    messages = guardian(messages=[])
    messages = robocaller(messages=messages)
    messages = guardian(messages=messages)
    pprint(messages)


def run():
    app.run(host='0.0.0.0', debug=True)

if __name__ == '__main__':
    load_dotenv()  # take environment variables from .env
    openai.api_key = os.getenv("OPENAI_API_KEY")
    fire.Fire()