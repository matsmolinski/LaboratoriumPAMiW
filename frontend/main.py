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

@app.route('/publications/<title>', methods=['GET'])
def get_pub(title):
	URL = "http://backend/publications/" + title
	r = requests.get(url = URL) 
	data = r.json()
	pub = {
		"title": data['title'],
		"author": data["author"],
		"publisher": data["publisher"]
	}
	titleclean = data['title'].replace(" ", "")
	return render_template("publicationForm.html", links = data["links"], publication = pub, title = titleclean)

#@app.route("/publications/<title>", methods=["POST"])
#def upload_pdf(title):
#	URL = "http://backend/publications/" + title
#	files = {
#		'name': request.files['pdf'].filename,
#		
#	}
#	r = requests.post(url = URL, files= request.files, json={'filename': )
#	print(request.files['pdf'].filename)
#	return redirect(url_for('get_pub', title=title))

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
