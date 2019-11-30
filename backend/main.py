from flask import Flask, jsonify, Blueprint, request, Response, render_template, redirect, send_file, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_swagger_ui import get_swaggerui_blueprint
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
 
SWAGGER_URL = "/swagger"
API_URL = "/static/swagger.json"
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        "app_name": "backend"
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


def addUser(login, email, password):
    db.hset(login, "email", email)
    db.hset(login, "password", password)

def isLoginInDatabase(login):
    email = db.hget(login, 'email')
    if email == None:
        return False
    return True

def checkPassword(user):
    if db.hget(user["name"], "password") == user['password']:
        return True
    return False
    
@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory('static', path)

@app.route('/database', methods=['POST'])
def tryToAddLogin():
    try:
        user = json.loads(request.data)
        login = user['name']
        email = user['email']
        password = user['password']

        if isLoginInDatabase(login):
            return Response("Login " + login + " is already in use!", 201)
        else:
            addUser(login, email, password)
            return Response("User " + login + " successfully added", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route('/login', methods=['POST'])
def tryToLogIn():
    try:
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
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)
    

@app.route('/logout', methods=['POST'])
def tryToLogOut():
    try:
        user = json.loads(request.data)
        db.delete(user["sessionid"])
        return Response("Logged out", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)
    

@app.route('/check', methods=['POST'])
def checkIfLoggedIn():
    try:
        session = db.get(request.data)
        if session == None:
            return Response("Authorization failed", 201)
        return Response("Everything fine", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route('/pdfs/list', methods=['GET'])
def getPdfList():
    files = db.hvals("filenames")
    message = {
        "links": files
    }
    return Response(json.dumps(message), 200)

@app.route("/pdfs", methods=["POST"])
def uploadPdf():
    try:
        f = request.files["pdf"]
        savePdf(f)
        return redirect("http://localhost:3000/cloud")
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

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
