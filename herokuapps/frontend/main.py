from flask import Flask, Blueprint, request, Response, render_template, url_for, redirect, make_response
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
	URL = "https://backendpamiw.herokuapp.com/check" 
	r = requests.post(url = URL, json={"sessionid": request.cookies.get("sessionid")})
	if not r.ok:
		error = None
		if('error' in request.args):
			error = request.args['error']
		resp = make_response(render_template("loginForm.html", error=error))
		resp.set_cookie('sessionid', '', expires=0)
		resp.set_cookie('jwt', '', expires=0)
		return resp
	else:
		return redirect(url_for('app_cloud'))
	return render_template("loginForm.html", error=error)

@app.route('/cloud/', methods=['GET'])
def app_cloud():
#	try:
		URL = "https://backendpamiw.herokuapp.com/check" 
		r = requests.post(url = URL, json={"sessionid": request.cookies.get("sessionid")})
		if not r.ok:
			return redirect(url_for('app_login', error='You are not logged in'))

		URL = "https://backendpamiw.herokuapp.com/publications" 
		r = requests.get(url = URL, headers={"Authorization": request.cookies.get("jwt")}) 		
		data = r.json()
		print(data, file=sys.stderr)
		return render_template("cloudForm.html", links = data["links"], names= data["names"], length=len(data['links']))
#	except Exception as e:
#		print(e, file = sys.stderr)
#		return render_template("loginForm.html")
	

@app.route('/add-publication/', methods=['GET', 'POST'])
def add_pub():
	if request.method == 'GET':
		URL = "https://backendpamiw.herokuapp.com/check" 
		r = requests.post(url = URL, json={"sessionid": request.cookies.get("sessionid")})
		if not r.ok:
			return redirect(url_for('app_login', error='You are not logged in'))

		return render_template('publicationAddForm.html')
	else:
		title = request.form['title']
		author = request.form['author']
		publisher = request.form['publisher']
		accessibility = request.form['accessibility']
		names = None
		if accessibility == 'custom':
			names = request.form['users']
			names = names.replace(" ", "")
			names = names.split(",")
		URL = "https://backendpamiw.herokuapp.com/publications" 
		r = requests.post(url = URL, json={'title': title, 'author': author, 'publisher': publisher, 'accessibility': accessibility, 'names': names}, headers={"Authorization": request.cookies.get("jwt")})
		if r.status_code == 200:
			return redirect(url_for('app_cloud'))
		else:
			return render_template('publicationAddForm.html', error=r.content.decode('utf-8'))

@app.route('/change-password/', methods=['GET', 'POST'])
def change_pas():
	if request.method == 'GET':
		URL = "https://backendpamiw.herokuapp.com/check" 
		r = requests.post(url = URL, json={"sessionid": request.cookies.get("sessionid")})
		if not r.ok:
			return redirect(url_for('app_login', error='You are not logged in'))

		return render_template('changePasswordForm.html',  error=None)
	else:
		oldPassword = request.form['oldpassword']
		newPassword = request.form['newpassword']
		URL = "https://backendpamiw.herokuapp.com/changepassword" 
		r = requests.post(url = URL, json={'oldPassword': oldPassword, 'newPassword': newPassword, 'sessionid': request.cookies.get("sessionid")}, headers={"Authorization": request.cookies.get("jwt")})
		return render_template('changePasswordForm.html', error=r.content.decode('utf-8'))


@app.route('/recover-password/', methods=['GET', 'POST'])
def recover_pas():
	if request.method == 'GET':
		return render_template('recoverPasswordForm.html',  error=None)
	else:
		login = request.form['login']
		email = request.form['email']
		recoveryCode = request.form['recoverycode']
		newPassword = request.form['newpassword']
		URL = "https://backendpamiw.herokuapp.com/recoverpassword" 
		r = requests.post(url = URL, json={'login': login, 'newPassword': newPassword, 'recoveryCode': recoveryCode, 'email': email})
		return render_template('recoverPasswordForm.html', error=r.content.decode('utf-8'))

@app.route('/publications/<title>', methods=['GET'])
def get_pub(title):
	try:
		URL = "https://backendpamiw.herokuapp.com/check" 
		r = requests.post(url = URL, json={"sessionid": request.cookies.get("sessionid")})
		if not r.ok:
			return redirect(url_for('app_login', error='You are not logged in'))

		URL = "https://backendpamiw.herokuapp.com/publications/" + title
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
		error = None
		if('error' in request.args):
			error = request.args['error']
		return render_template("publicationForm.html", links = data["links"], publication = pub, title = titleclean, error = error)
	except Exception as e:
		print(e, file = sys.stderr)
		return render_template("loginForm.html")
@app.route("/publications/<title>", methods=["POST"])
def upload_pdf(title):
	file = request.files.get('file')
	URL = "https://backendpamiw.herokuapp.com/publications/" + title
	files = {'file': (file.filename, file, 'application/pdf')}
	r = requests.post(url = URL, files=files, headers={"Authorization": request.cookies.get("jwt")} )
	if r.status_code == 200:
		return redirect(url_for('get_pub', title=title))
	else:
		return redirect(url_for('get_pub', title=title, error=r.content.decode('utf-8')))
	#if r.ok:
	#	return redirect(url_for('get_pub', title=title))

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=port)#, ssl_context=('app.crt', 'app.key'))
