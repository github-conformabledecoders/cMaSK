from flask import Flask, request, jsonify, Blueprint, current_app
import bcrypt
from config import config
from connect import connect
import psycopg2
import psycopg2.extras
import jwt
from datetime import datetime
import os
from functools import wraps
import json

auth = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    name = data['name']
    age = data['age']
    password = data['password']

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    sql = """
    INSERT INTO users (username, name, age, hashed_password)
    VALUES (%s, %s, %s, %s)
    """
    conn = None
    try:
        conn = connect()
        cur = conn.cursor()
        # create table one by one
        cur.execute(sql, (username, name, age, hashed.decode()))
        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        return {'msg': (str(error))}, 400
    finally:
        if conn is not None:
            conn.close()
    return {'msg': 'Successfully registered account.'}, 200


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    sql = """
    SELECT * FROM users WHERE username=%s;
    """

    conn = None
    authenticated = False
    try:
        conn = connect()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(sql, (username,))
        user = cur.fetchone()
        hashedpw = user.get('hashed_password')
        user_id = user.get('user_id')

        authenticated = bcrypt.checkpw(
            password.encode('utf8'), hashedpw.encode('utf8'))

        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        return {'msg': str(error)}, 400
    if authenticated:
        encoded_jwt = jwt.encode(
                {'user': username, 'user_id': user_id, 'iat': datetime.now()}, os.environ.get('SECRET_KEY'))
        return json.dumps({'msg': 'Successfully logged in.', 'user_id': user_id, 'token': encoded_jwt}), 200
    else:
        return {'msg': 'Invalid username or password.'}, 400


def protected(fn):
    @wraps(fn)
    def decorator(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return {'msg': 'No JWT Token.'}, 401

        try:
            data = jwt.decode(token, os.environ.get(
                'SECRET_KEY'), algorithms=["HS256"])
            user_id = data['user_id']
        except:
            return {'msg': 'Invalid token.'}, 401
        return fn(user_id, *args, **kwargs)

    return decorator
