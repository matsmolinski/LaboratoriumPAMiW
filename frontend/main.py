from flask import Flask, Blueprint, request, Response, render_template
import requests
import json
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
	URL = "http://backend/pdfs/list" 
	r = requests.get(url = URL) 
	data = r.json()
	return render_template("cloudForm.html", links = data["links"])

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
