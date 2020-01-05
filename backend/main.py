from flask import Flask, jsonify, Blueprint, request, Response, render_template, redirect, send_file, send_from_directory, jsonify
from flask_cors import CORS
#from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
import os
import sys
import redis
import json
import random
import string
import shutil

def generateKey(stringLength):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(stringLength))

app = Flask(__name__)
CORS(app)
port = int(os.environ.get("PORT", 5000))

#dbauth = redis.Redis(host = 'redis', port = 6379, decode_responses=True, db = 0)
#db = redis.Redis(host = 'redis', port = 6379, decode_responses=True, db = 1)
dbauth = redis.from_url(os.environ.get("REDIS_URL"), db = 0)
db = redis.from_url(os.environ.get("REDIS_URL"), db = 1)
dbauth.flushall()
db.flushall()
secret_key = generateKey(20)
#app.config["JWT_SECRET_KEY"] = generateKey(20)
#app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 300
#jwt = JWTManager(app)
 
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
    if db.hget(user["name"], "password").decode("utf-8") == user['password']:
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
                dbauth.set(sessionid, user["name"], ex = 300)
                #access_token = create_access_token(identity = user["name"])
                access_token = jwt.encode({'user': sessionid}, secret_key, algorithm='HS256')
                db.lpush('users', sessionid)
                message = {
                    "sessionid": sessionid,
                    "jwt": access_token.decode('utf-8')
                }
                #resp.set_cookie('sessionid', sessionid, domain='localhost')
                #resp.set_cookie('jwt', access_token.decode('utf-8'), domain='dev.localhost')
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
        jwtek = request.headers.get('Authorization')
        decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

        if not checkJwt(decoded):
            return 'JWT authentication failed', 400
            
        user = json.loads(request.data)
        dbauth.delete(user["sessionid"])
        #db.lrem('users', 0, user["sessionid"])
        return Response("Logged out", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)
    

@app.route('/check', methods=['POST'])
def checkIfLoggedIn():
    try:
        #users = db.lrange('users', 0, 100000)       
        session = dbauth.get(request.data)
        if session == None:
            return Response("Authorization failed", 201)
        return Response("Everything fine", 200)
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

#@app.route('/pdfs/list', methods=['GET'])
#def getPdfList():
 #   files = db.lrange('filenames', 0, 1000000)
  #  message = {
   #     "links": files
    #}
    #return Response(json.dumps(message), 200)

@app.route("/publications/<title>", methods=["POST"])
def uploadPdf(title):
    try:
        f = request.files["pdf"]
        savePdf(f, title)
        return "ok", 200
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

        full_name = db.hget(title + '/' + name, "path_to_file").decode("utf-8")
        org_filename = db.hget(title + '/' + name, "org_filename").decode("utf-8")
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

        title = request.get_json()['title'].replace(" ", "")
        db.hset(title, 'title', request.get_json()['title'])
        db.hset(title, 'author', request.get_json()['author'])
        db.hset(title, 'publisher', request.get_json()['publisher'])
        db.lpush('pubnames', title)
        return "ok", 200
    except Exception as e:
        print(e, file = sys.stderr)
        return Response("Failed to read request", 400)

@app.route("/publications", methods=["GET"])
def getPublications():
    jwtek = request.headers.get('Authorization')
    decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

    if not checkJwt(decoded):
        return 'JWT authentication failed', 400

    files = db.lrange('pubnames', 0, 1000000)
    proper_files = []
    for fil in files:
        proper_files.append(fil.decode("utf-8"))
    message = {
        "links": proper_files
    }
    return Response(json.dumps(message), 200)

@app.route("/publications/<title>", methods=["GET"])
def getPublication(title):
    jwtek = request.headers.get('Authorization')
    decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

    if not checkJwt(decoded):
        return 'JWT authentication failed', 400

    files = db.lrange(title + " filenames", 0, 100000)
    proper_files = []
    for fil in files:
        proper_files.append(fil.decode("utf-8"))
    message = {
        "title": db.hget(title, 'title').decode("utf-8"),
        "author": db.hget(title, 'author').decode("utf-8"),
        "publisher": db.hget(title, 'publisher').decode("utf-8"),
        "links": proper_files
    }
    return Response(json.dumps(message), 200)

@app.route("/publications/<title>", methods=["DELETE"])
def removePublication(title):
    jwtek = request.headers.get('Authorization')
    decoded = jwt.decode(jwtek.encode(), secret_key, algorithms='HS256')

    if not checkJwt(decoded):
        return 'JWT authentication failed', 400

    files = db.lrange(title + " filenames", 0, 1000000)
    proper_files = []
    for fil in files:
        proper_files.append(fil.decode("utf-8"))
    shutil.rmtree('files/' + title, ignore_errors=True)
    for f in proper_files:
        db.delete(title + f)
        
    db.delete(title + " filenames")
    db.delete(title)
    db.lrem("pubnames", 0, title)
    return "Publication is no more", 200

def savePdf(file_to_save, title):
    if not os.path.exists("files/" + title):
        os.mkdir("files/" + title)
        print("Directory " , "files/" + title ,  " Created ")
    path_to_file = "files/" + title + '/' + file_to_save.filename
    file_to_save.save(path_to_file)
    db.hset(title + '/' + file_to_save.filename, "org_filename", file_to_save.filename)
    db.hset(title + '/' + file_to_save.filename, "path_to_file", path_to_file)
    db.lpush(title + " filenames", file_to_save.filename)

def removePdf(name, title):
    path_to_file = "files/"+ title + '/' + name
    os.remove(path_to_file)
    db.delete(name)
    db.lrem(title + " filenames", 0, name)

def checkJwt(token):
    if token == None:
        return False
    if dbauth.get(token['user']) == None:
        return False
    #for user in db.lrange('users', 0, 1000000):
    #    if user == token['user']:
    #        return True
    return True

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=port)
