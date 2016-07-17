import os,csv,json
from flask import Flask, render_template, jsonify,request, session, redirect, url_for, _app_ctx_stack
from flask.ext.compress import Compress
import copy
import json
import re

app = Flask(__name__)
Compress(app)

@app.route('/static/<name>')
def sendFile(fileName = None):
	return send_from_directory('static', fileName)

@app.route('/')
def renderIndexMain():
	return render_template('index.html')

if __name__ == "__main__":
	app.run(debug=True,threaded=True,port=5000)