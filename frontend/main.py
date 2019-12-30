from flask import Flask, Blueprint, request, Response, render_template, url_for, redirect
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
	URL = "http://backend/publications" 
	r = requests.get(url = URL) 
	data = r.json()
	return render_template("cloudForm.html", links = data["links"])

@app.route('/add-publication/', methods=['GET', 'POST'])
def add_pub():
	if request.method == 'GET':
		return render_template('publicationAddForm.html')
	else:
		title = request.form['title']
		author = request.form['author']
		publisher = request.form['publisher']
		URL = "http://backend/publications" 
		r = requests.post(url = URL, json={'title': title, 'author': author, 'publisher': publisher})
		return redirect(url_for('app_cloud'))

@app.route('/publication/<title>', methods=['GET'])
def get_pub():
	return render_template("publicationForm.html")
	
if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
