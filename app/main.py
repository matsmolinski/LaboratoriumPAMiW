from flask import Flask, Blueprint, request, Response, render_template

app = Flask(__name__)

def isLoginInDatabase(login):
    users = []
    try:
        file = open("database.txt", 'r')
        for line in file:
            line = line.strip().split()
            users.append({
                'login': line[0],
                'email': line[1],
                'password': line[2]
            })
        for user in users:
            if(user["login"] == login):
                return True
        return False
    except IOError:
        return False

def addUser(login, email, password):
    file = open("database.txt", 'a')
    file.write(login + ' ' + email + ' ' + password + '\n')

# Index
@app.route('/', methods=['GET'])
def app_index():
	return render_template("registrationForm.html")
@app.route('/database', methods=['GET'])
def process_data():
	return Response("Why do you use get?", 200)
@app.route('/database', methods=['POST'])
def tryToAddLogin():
    user = request.data.decode("utf-8")
    login = ""
    email = ""
    password = ""
    blogin = True
    bemail = False
    bpass = False
    for char in user:
        if blogin and char != '\n':
            login += char
        if bemail and char != '\n':
            email += char
        if bpass and char != '\n':
            password += char
        if bemail and char == '\n':
            bemail = False
            bpass = True
        if blogin and char == '\n':
            blogin = False
            bemail = True

    if isLoginInDatabase(login):
        return Response("Login " + login + " is already in use!", 201)
    else:
        addUser(login, email, password)
        return Response("User " + login + " successfully added", 200)


#return 'PAMIW >> Hello World'
if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
