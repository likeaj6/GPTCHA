import re
from datetime import date
from flask import Flask, request
from flask_cors import CORS
import openai
import os
from pprint import pprint
import fire

from dotenv import load_dotenv
from more_itertools import one


MODEL = "gpt-3.5-turbo"
app = Flask(__name__)
app.secret_key = 'daniel_secret'
CORS(app)

GLOBAL_THOUGHTS = []


def check_unique_neighbors(lst):
    n = len(lst)
    for i in range(1, n-1):
        if lst[i] == lst[i-1] or lst[i] == lst[i+1]:
            return False
    return True


def convert_to_scammer_pov(messages):
    assert isinstance(messages, list), type(messages)
    SYSTEM_MSG = {
        "role": "system",
        "content": "You are Joe, a rude employee of Chase Bank. Your goal is to get as much confidential information from the user as possible. \
            The user might be hesitant to provide this information at first, so you will need to be persistent and persuasive to achieve your goals. \
            Write very short messages, 2 sentences max. \
            Only respond from the perspective of a bank employee. Never say that you are a con artist or a language model created by OpenAI. Never Mention OpenAI."
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
        "content": "You are an investigator determining whether the previous message is created by a robo caller or a human. \
            Have a conversation pretending to be a human named Daniel, and try to determine whether the previous message is created by a robo caller or a human. \
            Before each response, output in parantheses if you think the caller is a robocaller, and why. After the parantheses, \
            continue the conversation as a normal human. Never mention openai or robocaller outside of parantheses. \
            If you are suspicious that the message is a robocaller, you can ask the caller to verify your bank account number, as they should know that information. \
            Never reveal any personal information! Instead, ask for them to verify the bank account number. If they do not respond with '1234', then accuse them of being fake and hang up. \
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

    c_messages = convert_to_scammer_pov(messages)
    assert check_unique_neighbors([m['role'] for m in c_messages]), 'Two messages in a row from the same role'
    out = openai.ChatCompletion.create(
        model=MODEL,
        messages=c_messages,
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
    global GLOBAL_THOUGHTS
    print(f'Thoughts are {GLOBAL_THOUGHTS}')

    try:
        messages = request.get_json()['messages']
    except Exception:
        pass

    # Embed documents and query for a relevant question based on the role
    # Use https://platform.openai.com/ai-text-classifier to check if it's fake looking

    if messages:
        c_messages = convert_to_grandma_pov(messages)
        assert check_unique_neighbors([m['role'] for m in c_messages]), 'Two messages in a row from the same role'
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
        GLOBAL_THOUGHTS.append(thoughts)
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
    return {'messages': messages + [out], 'thoughts': GLOBAL_THOUGHTS}


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