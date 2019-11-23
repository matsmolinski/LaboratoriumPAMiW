from flask import Flask, Blueprint, request, Response, render_template, redirect, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import os
import sys
import redis
import json
import random
import string

def generateKey(stringLength):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(stringLength))

app = Flask(__name__)
CORS(app)
db = redis.Redis(host = 'redis', port = 6379, decode_responses=True)

app.config["JWT_SECRET_KEY"] = generateKey(20)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 300
jwt = JWTManager(app)

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

def checkPassword(luser):
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
            if(user["login"] == luser['name']):
                if user["password"] == luser['password']:
                    return True
                return False
                
        return False
    except IOError:
        return False

def addUser(login, email, password):
    file = open("database.txt", 'a')
    file.write(login + ' ' + email + ' ' + password + '\n')

# Index
@app.route('/database', methods=['GET'])
def process_data():
    return Response("Why do you use get?", 200)

@app.route('/database', methods=['POST'])
def tryToAddLogin():
    user = json.loads(request.data)
    login = user['name']
    email = user['email']
    password = user['password']

    if isLoginInDatabase(login):
        return Response("Login " + login + " is already in use!", 201)
    else:
        addUser(login, email, password)
        return Response("User " + login + " successfully added", 200)

@app.route('/login', methods=['POST'])
def tryToLogIn():
    user = json.loads(request.data)
    if isLoginInDatabase(user["name"]):
        if checkPassword(user):
            sessionid = generateKey(10)
            db.set(sessionid, 1, ex = 300)
            access_token = create_access_token(identity = user["name"])
            message = {
                "sessionid": sessionid,
                "jwt": access_token
            }
            return Response(json.dumps(message), 200)
            
        else:
            return Response("Password is invalid", 211)
    else:
        return Response("User unrecognized", 210)

@app.route('/logout', methods=['POST'])
def tryToLogOut():
    user = json.loads(request.data)
    db.delete(user["sessionid"])
    return Response("Logged out", 200)

@app.route('/check', methods=['POST'])
def checkIfLoggedIn():
    session = db.get(request.data)
    if session == None:
        return Response("Authorization failed", 201)
    return Response("Everything fine", 200)

@app.route('/pdfs/list', methods=['GET'])
def getPdfList():
    files = db.hvals("filenames")
    message = {
        "links": files
    }
    return Response(json.dumps(message), 200)

@app.route("/pdfs", methods=["POST"])
def uploadPdf():
    f = request.files["pdf"]
    savePdf(f)
    return redirect("http://localhost:3000/cloud")

@app.route("/pdfs/<string:name>", methods=["GET"])
@jwt_required
def downloadPdf(name):
    full_name = db.hget(name, "path_to_file")
    org_filename = db.hget(name, "org_filename")
    if(full_name != None):
        try:
            return send_file(full_name, attachment_filename = org_filename)
        except Exception as e:
            print(e, file = sys.stderr)

    return org_filename, 200

def savePdf(file_to_save):

    path_to_file = "files/" + file_to_save.filename
    file_to_save.save(path_to_file)
    db.hset(file_to_save.filename, "org_filename", file_to_save.filename)
    db.hset(file_to_save.filename, "path_to_file", path_to_file)
    db.hset("filenames", file_to_save.filename, file_to_save.filename)


if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)


'''
filename_prefix = str(db.incr("file_counter"))
        new_filename = filename_prefix + file_to_save.filename
        path_to_file = "files/" + new_filename
        file_to_save.save(path_to_file)

        db.hset(new_filename, "org_filename", file_to_save.filename)
        db.hset(new_filename, "path_to_file", path_to_file)
        db.hset("filenames", new_filename, file_to_save.filename)
'''