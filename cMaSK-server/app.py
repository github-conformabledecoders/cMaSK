from email import header
from flask import Flask, make_response, render_template, request, jsonify, send_file
import jwt
from connect import connect
import psycopg2.extras
import os
from auth import auth, protected
import json
import datetime
import io
import csv
import tempfile
import requests

os.environ['SECRET_KEY'] = 'hello'

app = Flask(__name__)
app.register_blueprint(auth)

def date_converter(date):
    if isinstance(date, datetime.datetime):
        return date.__str__()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form['username']
        password = request.form['password']
        res = requests.post('http://smartfacemask.media.mit.edu/api/v1/auth/login', json={'username': username, 'password': password})
        print(res.status_code)
        data = res.json()
        if res.status_code == 200:
            response = make_response(render_template('logged-in.html'))
            response.set_cookie('x-access-token', data['token'])
            return response
        else:
            response = make_response(render_template('login-fail.html'))
            return response

@app.route('/data', methods=['GET'])
def get_data():
    jwt_token = request.cookies.get('x-access-token')
    res = requests.get('http://smartfacemask.media.mit.edu/api/v1/data', headers={'x-access-token': jwt_token})
    return res.json()

@app.route('/api/v1/data', methods=['GET', 'POST'])
def data():
    if request.method == 'GET':
        args = request.args.to_dict()
        user = args.get('user')
        if not loggedInUser:
            return json.dumps({'msg': 'login to view data'})
        save = args.get('save')
        conn = connect()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if save:
            cur = conn.cursor()

        if user:
            cur.execute('SELECT * FROM data WHERE user_id = %s', (loggedInUser,))
        else:
            cur.execute('SELECT * FROM data')

        result = cur.fetchall()

        if save:
            print('saving')
            with open('data.csv', 'w', newline='') as csvfile:
                writer = csv.writer(csvfile, delimiter=',')
                for row in result:
                    writer.writerow(row)
            return send_file('data.csv', download_name='data.csv'), 200

        count = len(result)
        return json.dumps({'count': count, 'data': result}, default=date_converter), 200
    else:
        conn = connect()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        data = request.get_json()
        user = data.get('user')
        sequence = data.get('sequence_id')
        acceleration = data.get('accelerometer')
        temp_1 = data.get('temp_1')
        temp_2 = data.get('temp_2')
        humidity_1 = data.get('humidity_1')
        humidity_2 = data.get('humidity_2')
        rtc = data.get('rtc')
        cap_1 = data.get('capATtiny1')
        cap_2 = data.get('capATtiny2')
        temp_pressure = data.get('temp_pressure')
        pressure = data.get('pressure')


        sql = """INSERT INTO data 
            (user_id, time, data_sequence, accel_x, accel_y, accel_z, 
            temperature_1, temperature_2, humidity_1, humidity_2,
            temp_pressure, pressure, capacitance_1, capacitance_2, 
            capacitance_3, capacitance_4, capacitance_5, capacitance_6, 
            capacitance_7, capacitance_8, capacitance_9, capacitance_10, 
            capacitance_11, capacitance_12, capacitance_13, capacitance_14, 
            capacitance_15, capacitance_16, capacitance_17, capacitance_18) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        data = (user, rtc, sequence, acceleration[0], acceleration[1], acceleration[2],
                temp_1, temp_2, humidity_1, humidity_2, temp_pressure, pressure) + tuple(cap_1) + tuple(cap_2)
        print(len(data))
        cur.execute(sql, data)
        cur.close()
        conn.commit()

        return {'msg': 'Data added successfully'}, 200


@app.route('/api/v1/user', methods=['GET', 'POST'])
@protected
def users(loggedInUser):
    if request.method == 'GET':
        conn = connect()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute('SELECT * FROM users WHERE user_id = %s', (loggedInUser))
        result = cur.fetchall()
        return json.dumps(result), 200
    else:
        conn = connect()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        data = request.get_json()
        values = (data.get('name'), data.get('age'))

        cur.execute(
            'INSERT INTO users (name, age) VALUES (%s, %s)', values)

        cur.close()
        conn.commit()

        return {'msg': 'User added successfully'}, 200
