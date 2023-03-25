from flask import Flask

app = Flask(__name__)

@app.route('/robocaller')
def robocaller():
    return 'Hello, World!'

@app.route('/guardian')
def guardian():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
