from flask import Flask, Blueprint, request, Response, render_template

app = Flask(__name__)

# Index
@app.route('/', methods=['GET'])
def app_index():
	return render_template("registrationForm.html")

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=80)
