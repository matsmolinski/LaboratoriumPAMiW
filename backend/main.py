from flask import Flask, Blueprint, request, Response, render_template
from flask_cors import CORS
import redis
import json

app = Flask(__name__)
CORS(app)
db = redis.Redis(host = 'redis', port = 6379, decode_responses=True)

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
    db.set("slawek", 30)
    db.expire("slawek", 60)
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

@app.route('/authorise', methods=['POST'])
def tryToLogIn():
    user = json.loads(request.data)
    if isLoginInDatabase(user["name"]):
        if checkPassword(user):
            return Response("User logged in", 200)
        else:
            return Response("Password is invalid", 211)
    else:
        return Response("User unrecognized", 210)

#return 'PAMIW >> Hello World'
if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
