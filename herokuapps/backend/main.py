from flask import Flask, jsonify, Blueprint, request, Response, render_template, redirect, send_file, send_from_directory, jsonify
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
import os
import sys
import redis
import json
import random
import string
import shutil
import time
import crypt
import math
from flask_socketio import SocketIO, join_room, leave_room, emit, send

def generateKey(stringLength):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(stringLength))

app = Flask(__name__)
CORS(app)
socket_io = SocketIO(app, cors_allowed_origins="*")


port = int(os.environ.get("PORT", 5000))

#dbauth = redis.Redis(host = 'redis', port = 6379, decode_responses=True, db = 0)
#db = redis.Redis(host = 'redis', port = 6379, decode_responses=True, db = 1)
dbauth = redis.from_url(os.environ.get("REDIS_URL"), db = 0, decode_responses=True)
db = redis.from_url(os.environ.get("REDIS_URL"), db = 1, decode_responses=True)
dbauth.flushall()
db.flushall()
secret_key = generateKey(20)
 
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
    salt = generateKey(20)
    crypted_password = crypt.crypt(password, salt)
    for i in range(1000):
        crypted_password = crypt.crypt(crypted_password, salt)
    db.hset(login, "password", crypted_password)
    db.hset(login, "salt", salt)

def changePassword(login, new_password):
    salt = generateKey(20)
    crypted_password = crypt.crypt(new_password, salt)
    for i in range(1000):
        crypted_password = crypt.crypt(crypted_password, salt)
    db.hset(login, "password", crypted_password)
    db.hset(login, "salt", salt)

def isLoginInDatabase(login):
    email = db.hget(login, 'email')
    if email == None:
        return False
    return True

def calc_entropy(password):
    return len(password) * (math.log(len(string.ascii_lowercase), 2))

def checkPassword(username, password):
    salt = db.hget(username, "salt")
    crypted_password = crypt.crypt(password, salt)
    for i in range(1000):
        crypted_password = crypt.crypt(crypted_password, salt)
    if db.hget(username, "password") == crypted_password:
        return True
    return False
    
@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory('static', path)

@app.route('/register', methods=['POST'])
def tryToAddLogin():
    try:
        user = json.loads(request.data)
        login = user['name']
        email = user['email']
        password = user['password']
        if isLoginInDatabase(login):
            return Response("Login " + login + " is already in use!", 201)
        if len(password) < 8:
            return Response("Your password is too short (min. 8 chars)", 201)
        for char in login:
            if not char.isdigit() and not char.isalpha() and char != ' ':
                return Response("Login can only have digits, letters or spaces", 201)
        for char in email:
            if not char.isdigit() and not char.isalpha() and not char in " @.":
                return Response("Give us email without custom chars", 201)
        else:
            addUser(login, email, password)
            warn = ""
            if calc_entropy(password) < 40:
                warn = "\n       Warning: Your password is weak :("
            return Response("User " + login + " successfully added" + warn, 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route('/login', methods=['POST'])
def tryToLogIn():
    try:
        user = json.loads(request.data)
        for char in user["name"]:
            if not char.isdigit() and not char.isalpha() and char != ' ':
                return Response("Login can only have digits, letters or spaces", 201)
        if isLoginInDatabase(user["name"]):
            if checkPassword(user["name"], user['password']):
                sessionid = generateKey(10)
                dbauth.set(sessionid, user["name"], ex = 900)
                access_token = jwt.encode({'user': user["name"]}, secret_key, algorithm='HS256')
                message = {
                    "sessionid": sessionid,
                    "jwt": access_token.decode('utf-8')
                }
                return Response(json.dumps(message), 200)
                
            else:
                time.sleep(2)
                return Response("Password is invalid", 211)
        else:
            return Response("User unrecognized", 210)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)
    

@app.route('/logout', methods=['DELETE'])
def tryToLogOut():
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400
            
        username = decoded['user']
        user = json.loads(request.data)
        
        if not username == dbauth.get(user["sessionid"]):
            return 'Authorization error - jwt does not match session', 400

        dbauth.delete(user["sessionid"])
        return Response("Logged out", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route('/changepassword', methods=['POST'])
def changeUserPassword():
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400
            
        username = decoded['user']
        user = json.loads(request.data)
        
        if not username == dbauth.get(user["sessionid"]):
            return 'Authorization error - jwt does not match session', 400

        if not checkPassword(username, user['oldPassword']):
            return 'Authorization error - incorrect old password', 400

        if len(user['newPassword']) < 8:
            return Response("Your password is too short (min. 8 chars)", 201)
        else:
            warn = ""
            if calc_entropy(user['newPassword']) < 40:
                warn = "\n       Warning: Your password is weak :("
            changePassword(username, user['newPassword'])
            return Response("Password changed" + warn, 200)
    except Exception as e:
        print(e, flush=True)
        return Response("Failed to read request", 400)

@app.route('/check', methods=['POST'])
def checkIfLoggedIn():
    try:   
        jsn = json.loads(request.data) 
        session = dbauth.get(jsn['sessionid'])
        if session == None:
            return Response("Authorization failed", 400)          
        return Response("Everything fine", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route("/publications/<title>", methods=["POST"])
def uploadPdf(title):
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400

        username = decoded['user']
        if db.hget(title, 'owner') != username:
            users = db.lrange(title + '/access', 0, 100000)
            if users == None:
                return 'JWT authentication failed', 420
            if users[0] != 'public':
                access = False
                for user in users:
                    if user == username:
                        access = True
                if not access:
                    return 'JWT authentication failed', 420

        f = request.files['file']
        for char in f.filename:
            if not char.isdigit() and not char.isalpha() and not char in " .@?#!():;%":
                return Response("Filename contains forbidden character(s)", 201)
    
        if savePdf(f, title):
            return "ok", 200
        else:
            return "File exists", 201
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route("/publications/<title>/<name>", methods=["GET", "DELETE"])
def downloadDeletePdf(title, name):
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400

        username = decoded['user']
        if db.hget(title, 'owner') != username:
            users = db.lrange(title + '/access', 0, 100000)
            if users == None:
                return 'JWT authentication failed', 420
            if users[0] != 'public':
                access = False
                for user in users:
                    if user == username:
                        access = True
                if not access:
                    return 'JWT authentication failed', 420


        full_name = db.hget(title + '/' + name, "path_to_file")
        org_filename = db.hget(title + '/' + name, "org_filename")
        print(title)
        print(name)
        if(full_name != None):
            try:
                if request.method == 'GET':                   
                    return send_file(full_name, attachment_filename = org_filename)
                else:
                    removePdf(name, title)
                    return "File is no more", 200
                
            except Exception as e:
                print(e, file = sys.stderr)

        return org_filename, 200
    except Exception as e:
        print(e, file = sys.stderr)
        return 'JWT authentication failed', 400

@app.route("/publications", methods=["POST"])
def addPublication():
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400

        username = decoded['user']
        pub = json.loads(request.data)
        for char in pub['title']:
            if not char.isdigit() and not char.isalpha() and not char in " @.?!():;%":
                return Response("Title contains forbidden character(s)", 201)
        for char in pub['author']:
            if not char.isdigit() and not char.isalpha() and not char in " .":
                return Response("Author contains forbidden character(s)", 201)
        for char in pub['publisher']:
            if not char.isdigit() and not char.isalpha() and not char in " .":
                return Response("Publisher contains forbidden character(s)", 201)
        title = pub['title'].replace(" ", "")
        if db.hget(title, 'title') != None:
            return "This publication is already in database", 201
        forbidden_names = ['pubnames', 'filenames', 'access']
        if title in forbidden_names:
            return "This name is forbidden", 203
        db.hset(title, 'title', pub['title'])
        db.hset(title, 'author', pub['author'])
        db.hset(title, 'publisher', pub['publisher'])
        db.hset(title, 'owner', username)
        if pub['accessibility'] == 'public':
            db.lpush(title + '/access', 'public')
        if pub['accessibility'] == 'custom':
            for user in pub['names']:
                db.lpush(title + '/access', user)           
        db.lpush('pubnames', title)
        socket_io.emit('publication added', 'Pub added', broadcast=True)
        return "ok", 200
    except Exception as e:
        print(e, flush=True)
        return Response("Failed to read request", 400)

@app.route("/publications", methods=["GET"])
def getPublications():
    try:
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400
        username = decoded['user']
        files = db.lrange('pubnames', 0, 1000000)
        pub_codes = []
        pub_names = []
        for fil in files:
            users = db.lrange(fil + '/access', 0, 100000)
            print(users, flush=True)   
            if db.hget(fil, 'owner') == username:
                pub_codes.append(fil)
                pub_names.append(db.hget(fil, 'title'))
                continue
            if users != []:
                if users[0] == 'public':
                    pub_codes.append(fil)
                    pub_names.append(db.hget(fil, 'title'))
                    continue
                for user in users:
                    if user == username:
                        pub_codes.append(fil)
                        pub_names.append(db.hget(fil, 'title'))
                        break
        message = {
            "links": pub_codes,
            "names": pub_names
        }
        return Response(json.dumps(message), 200)
    except Exception as e:
        print(e, flush=True)
        return Response("Failed to read request", 400)

@app.route("/publications/<title>", methods=["GET"])
def getPublication(title):
    jwtek = request.headers.get('Authorization')
    decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

    if not checkJwt(decoded):           
        return 'JWT authentication failed', 400

    username = decoded['user']
    if db.hget(title, 'owner') == None:
        return 'Publication unrecognized', 410
    if db.hget(title, 'owner') != username:
        users = db.lrange(title + '/access', 0, 100000)
        if users == None:
            return 'JWT authentication failed', 420
        if users[0] != 'public':
            access = False
            for user in users:
                if user == username:
                    access = True
            if not access:
                return 'JWT authentication failed', 420                  

    files = db.lrange(title + "/filenames", 0, 100000)
    message = {
        "title": db.hget(title, 'title'),
        "author": db.hget(title, 'author'),
        "publisher": db.hget(title, 'publisher'),
        "links": files
    }
    return Response(json.dumps(message), 200)

@app.route("/publications/<title>", methods=["DELETE"])
def removePublication(title):
    jwtek = request.headers.get('Authorization')
    decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

    if not checkJwt(decoded):
        return 'JWT authentication failed', 400

    username = decoded['user']
    if db.hget(title, 'owner') != username:
        users = db.lrange(title + '/access', 0, 100000)
        if users == None:
            return 'JWT authentication failed', 420
        if users[0] != 'public':
            access = False
            for user in users:
                if user == username:
                    access = True
            if not access:
                return 'JWT authentication failed', 420

    files = db.lrange(title + "/filenames", 0, 1000000)
    shutil.rmtree('files/' + title, ignore_errors=True)
    for f in files:
        db.delete(title + f)
        
    db.delete(title + "/filenames")
    db.delete(title)
    db.lrem("pubnames", 0, title)
    return "Publication is no more", 200

def savePdf(file_to_save, title):
    if not os.path.exists("files/" + title):
        os.mkdir("files/" + title)
    if db.hget(title + '/' + file_to_save.filename, "org_filename") != None:
        return False
    
    path_to_file = "files/" + title + '/' + file_to_save.filename
    file_to_save.save(path_to_file)
    db.hset(title + '/' + file_to_save.filename, "org_filename", file_to_save.filename)
    db.hset(title + '/' + file_to_save.filename, "path_to_file", path_to_file)
    db.lpush(title + "/filenames", file_to_save.filename)
    return True

def removePdf(name, title):
    path_to_file = "files/" + title + '/' + name
    os.remove(path_to_file)
    db.delete(name)
    db.lrem(title + "/filenames", 0, name)

def checkJwt(token):
    if token == None:
        return False
    if db.hget(token['user'], 'email') == None:
        return False
    return True

if __name__ == "__main__":
	socket_io.run(app, host='0.0.0.0', port=port)
