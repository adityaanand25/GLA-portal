from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask_socketio import SocketIO, emit   # New.

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")   # New

SECRET_KEY = 'your_secret_key'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['user']
        except:
            return jsonify({'message': 'Token is invalid!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def get_db_connection():
    conn = sqlite3.connect('students.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/idcards', methods=['POST'])
@token_required
def submit_idcard_request(current_user):
    data = request.get_json()
    user_id = data.get('user_id')
    student_name = data.get('student_name')
    reason = data.get('reason')
    if not (user_id and student_name and reason):
        return jsonify({'error': 'Missing fields'}), 400
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO id_card_requests (user_id, student_name, reason, status, created_at, updated_at)
        VALUES (?,?,?,?,?,?)
    ''', (user_id, student_name, reason, 'Pending', now, now))
    conn.commit()
    request_id = cursor.lastrowid
    conn.close()
    new_request = {
        'id': request_id, 
        'user_id': user_id, 
        'studentName': student_name, 
        'reason': reason, 
        'status': 'Pending', 
        'createdAt': now, 
        'updatedAt': now
    }
    socketio.emit('idcard_update', new_request, broadcast=True)   # New
    return jsonify(new_request), 201

@app.route('/api/idcards/<int:request_id>/approve', methods=['POST'])
@token_required
def approve_idcard(current_user, request_id):
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE id_card_requests SET status = ?, updated_at = ? WHERE id = ?", ('Approved', now, request_id))
    conn.commit()
    conn.close()
    socketio.emit('idcard_update', {'id': request_id, 'status': 'Approved', 'updatedAt': now}, broadcast=True)   # New
    return jsonify({'message': 'Request approved', 'updated_at': now}), 200

@app.route('/api/idcards/<int:request_id>/reject', methods=['POST'])
@token_required
def reject_idcard(current_user, request_id):
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE id_card_requests SET status = ?, updated_at = ? WHERE id = ?", ('Rejected', now, request_id))
    conn.commit()
    conn.close()
    socketio.emit('idcard_update', {'id': request_id, 'status': 'Rejected', 'updatedAt': now}, broadcast=True)   # New
    return jsonify({'message': 'Request rejected', 'updated_at': now}), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, port=3000)   # Modified