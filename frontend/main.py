from flask import Flask, Blueprint, request, Response, render_template

app = Flask(__name__)

@app.route('/', methods=['GET'])
def app_default():
	return render_template("registrationForm.html")

@app.route('/registration/', methods=['GET'])
def app_register():
	return render_template("registrationForm.html")

@app.route('/login/', methods=['GET'])
def app_login():
	return render_template("loginForm.html")

@app.route('/cloud/', methods=['GET'])
def app_cloud():
	return render_template("cloudForm.html")

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
