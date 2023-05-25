from flask import Flask, render_template, redirect

app = Flask(__name__)

name='加密聊天室 DEMO'

@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html', name=name)

#----------分隔線---------------
# chat rooms
@app.route('/AES')
def aes():
    return render_template('roomAES.html', name=name)

@app.route('/RSA')
def rsa():
    return render_template('roomRSA.html', name=name)

@app.route('/ECC')
def ecc():
    return render_template('roomECC.html', name=name)

if __name__ == '__main__':
    app.run()