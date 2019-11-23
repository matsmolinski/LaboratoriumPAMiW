from flask import Flask, Blueprint, request, Response, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import os
import redis
import json
import random
import string

def generateKey(stringLength):
    characters = string.ascii_letters + string.digits + string.punctuation
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

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
