from flask import Flask, Blueprint, request, Response, render_template, url_for, redirect
import requests
import json
import os
import sys
app = Flask(__name__)
port = int(os.environ.get("PORT", 5000))
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
	try:
		URL = "http://backendpamiw.herokuapp.com/publications" 
		r = requests.get(url = URL, headers={"Authorization": request.cookies.get("jwt")}) 
		data = r.json()
		print(data, file=sys.stderr)
		return render_template("cloudForm.html", links = data["links"], names= data["names"], length=len(data['links']))
	except Exception as e:
		print(e, file = sys.stderr)
		return render_template("loginForm.html")
	

@app.route('/add-publication/', methods=['GET', 'POST'])
def add_pub():
	if request.method == 'GET':
		return render_template('publicationAddForm.html')
	else:
		title = request.form['title']
		author = request.form['author']
		publisher = request.form['publisher']
		URL = "http://backendpamiw.herokuapp.com/publications" 
		r = requests.post(url = URL, json={'title': title, 'author': author, 'publisher': publisher}, headers={"Authorization": request.cookies.get("jwt")})
		return redirect(url_for('app_cloud'))

@app.route('/publications/<title>', methods=['GET'])
def get_pub(title):
	try:
		URL = "http://backendpamiw.herokuapp.com/publications/" + title
		r = requests.get(url = URL, headers={"Authorization": request.cookies.get("jwt")})
		if not r.ok:
			return render_template("loginForm.html")
		data = r.json()
		print(data, file=sys.stderr)
		pub = {
			"title": data['title'],
			"author": data["author"],
			"publisher": data["publisher"]
		}
		titleclean = data['title'].replace(" ", "")
		return render_template("publicationForm.html", links = data["links"], publication = pub, title = titleclean)
	except Exception as e:
		print(e, file = sys.stderr)
		return render_template("loginForm.html")
@app.route("/publications/<title>", methods=["POST"])
def upload_pdf(title):
	file = request.files.get('file')
	URL = "http://backendpamiw.herokuapp.com/publications/" + title
	files = {'file': (file.filename, file, 'application/pdf')}
	r = requests.post(url = URL, files=files, headers={"Authorization": request.cookies.get("jwt")} )
	if r.ok:
		return redirect(url_for('get_pub', title=title))

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=port)
