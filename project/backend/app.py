from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import sqlite3
import logging
import os
from datetime import datetime

# Get the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    db_path = os.path.join(BASE_DIR, 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = dict_factory
    return conn

# Create or connect to the database
conn = get_db_connection()
cursor = conn.cursor()

# Create the users table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
''')

# Drop the id_card_requests table if it exists
cursor.execute('''
DROP TABLE IF EXISTS id_card_requests
''')

# Create the id_card_requests table
cursor.execute('''
CREATE TABLE IF NOT EXISTS id_card_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    card_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users (id)
)
''')

# Create the courses table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    credits INTEGER NOT NULL,
    instructor TEXT,
    department TEXT NOT NULL
)
''')

# Create the course_enrollments table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (course_id) REFERENCES courses (id),
    UNIQUE(student_id, course_id)
)
''')

# Create the complaints table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users (id)
)
''')

# Add some sample courses data if the table is empty
cursor.execute('SELECT COUNT(*) FROM courses')
if cursor.fetchone()['COUNT(*)'] == 0:
    cursor.executemany('''
        INSERT INTO courses (code, name, description, credits, instructor, department)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        ('CS101', 'Introduction to Computer Science', 'An introductory course covering the basic principles of computer science.', 3, 'Dr. John Smith', 'Computer Science'),
        ('CS201', 'Data Structures and Algorithms', 'Study of fundamental data structures and algorithms used in computer science.', 4, 'Dr. Jane Doe', 'Computer Science'),
        ('CS301', 'Database Systems', 'Design and implementation of database systems, including relational database theory and SQL.', 3, 'Prof. Michael Brown', 'Computer Science'),
        ('CS401', 'Software Engineering', 'Principles and practices of software engineering, including project management and software design.', 4, 'Dr. Sarah Wilson', 'Computer Science'),
        ('CS501', 'Artificial Intelligence', 'Introduction to artificial intelligence concepts, algorithms, and applications.', 3, 'Prof. Robert Davis', 'Computer Science')
    ])

# Add some sample data for testing
cursor.execute('''
INSERT INTO id_card_requests (student_id, student_name, card_type, reason, status, created_at)
VALUES 
    ('1', 'John Doe', 'standard', 'Lost previous card', 'Pending', datetime('now')),
    ('2', 'Jane Smith', 'proximity', 'Damaged card', 'Pending', datetime('now', '-1 day')),
    ('3', 'Alice Johnson', 'standard', 'First time request', 'Approved', datetime('now', '-2 days'))
''')

# Commit changes and close the connection
conn.commit()
conn.close()

app = Flask(__name__)
# Configure CORS to allow credentials and specific headers
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5174")

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
            
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not (name and email and password and role):
            return jsonify({'error': 'All fields are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Check if email already exists
            cursor.execute('SELECT email FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                return jsonify({'error': 'Email already registered'}), 409

            cursor.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        (name, email, password, role))
            conn.commit()
            user_id = cursor.lastrowid
            
            # Fetch the created user
            cursor.execute('SELECT id, name, email, role FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            
            return jsonify(user), 201
            
        except sqlite3.IntegrityError as e:
            conn.rollback()
            logging.error(f"Database integrity error: {str(e)}")
            return jsonify({'error': 'Could not create user'}), 400
        finally:
            conn.close()

    except Exception as e:
        logging.error(f"Error in /api/register: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
            
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not (email and password and role):
            return jsonify({'error': 'Missing fields'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM users WHERE email = ? AND password = ? AND role = ?', (email, password, role))
            user = cursor.fetchone()

            if not user:
                logging.debug(f"Login failed for email: {email}, role: {role}")
                return jsonify({'error': 'Invalid credentials or role mismatch'}), 401

            return jsonify({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }), 200
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error in /api/login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/idcards', methods=['GET'])
def get_id_cards():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                id_card_requests.*,
                users.name as student_name
            FROM id_card_requests
            JOIN users ON users.id = id_card_requests.student_id
            ORDER BY created_at DESC
        ''')
        requests = cursor.fetchall()
        conn.close()
        return jsonify(requests)
    except Exception as e:
        logging.error(f"Error fetching ID card requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/idcards', methods=['POST'])
def create_id_card_request():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        student_id = data.get('student_id')
        student_name = data.get('student_name')
        card_type = data.get('card_type')
        reason = data.get('reason')

        if not all([student_id, student_name, card_type, reason]):
            return jsonify({'error': 'All fields are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if student has a pending request
        cursor.execute('''
            SELECT id FROM id_card_requests 
            WHERE student_id = ? AND status = 'Pending'
        ''', (student_id,))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'You already have a pending ID card request'}), 409

        # Create new request
        cursor.execute('''
            INSERT INTO id_card_requests (student_id, student_name, card_type, reason, status)
            VALUES (?, ?, ?, ?, 'Pending')
        ''', (student_id, student_name, card_type, reason))
        
        request_id = cursor.lastrowid
        conn.commit()

        # Fetch the created request
        cursor.execute('''
            SELECT * FROM id_card_requests WHERE id = ?
        ''', (request_id,))
        new_request = cursor.fetchone()
        conn.close()

        if new_request:
            # Emit WebSocket event for admin notification
            socketio.emit('new_idcard_request', {
                'id': new_request['id'],
                'studentName': student_name,
                'cardType': card_type,
                'reason': reason,
                'status': 'Pending',
                'createdAt': new_request['created_at']
            })
            
            return jsonify(new_request), 201
        else:
            return jsonify({'error': 'Failed to create request'}), 500

    except Exception as e:
        logging.error(f"Error creating ID card request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/idcards/<int:request_id>/<string:action>', methods=['POST'])
def process_id_card(request_id, action):
    if action not in ['approve', 'reject']:
        return jsonify({'error': 'Invalid action'}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update the request status
        status = 'Approved' if action == 'approve' else 'Rejected'
        cursor.execute('''
            UPDATE id_card_requests 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (status, request_id))
        
        conn.commit()
        
        # Get the updated record
        cursor.execute('''
            SELECT * FROM id_card_requests WHERE id = ?
        ''', (request_id,))
        updated_request = cursor.fetchone()
        conn.close()
        
        if updated_request:
            # Emit WebSocket event
            socketio.emit('idcard_update', {
                'id': request_id,
                'status': status,
                'updatedAt': updated_request['updated_at']
            })
            return jsonify({
                'message': f'Request {status.lower()}',
                'updated_at': updated_request['updated_at']
            })
        else:
            return jsonify({'error': 'Request not found'}), 404
            
    except Exception as e:
        logging.error(f"Error processing ID card request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM courses')
        courses = cursor.fetchall()
        conn.close()
        return jsonify(courses)
    except Exception as e:
        logging.error(f"Error fetching courses: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/courses/enroll', methods=['POST'])
def enroll_course():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        student_id = data.get('student_id')
        course_id = data.get('course_id')

        if not all([student_id, course_id]):
            return jsonify({'error': 'All fields are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if already enrolled
        cursor.execute('''
            SELECT * FROM course_enrollments 
            WHERE student_id = ? AND course_id = ?
        ''', (student_id, course_id))
        
        if cursor.fetchone():
            # If already enrolled, unenroll by deleting the record
            cursor.execute('''
                DELETE FROM course_enrollments 
                WHERE student_id = ? AND course_id = ?
            ''', (student_id, course_id))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Successfully unenrolled', 'enrolled': False})

        # If not enrolled, create new enrollment
        cursor.execute('''
            INSERT INTO course_enrollments (student_id, course_id)
            VALUES (?, ?)
        ''', (student_id, course_id))
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Successfully enrolled', 'enrolled': True}), 201

    except Exception as e:
        logging.error(f"Error in course enrollment: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/courses/enrolled/<int:student_id>', methods=['GET'])
def get_enrolled_courses(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT c.*, ce.enrollment_date
            FROM courses c
            JOIN course_enrollments ce ON c.id = ce.course_id
            WHERE ce.student_id = ?
        ''', (student_id,))
        courses = cursor.fetchall()
        conn.close()
        return jsonify(courses)
    except Exception as e:
        logging.error(f"Error fetching enrolled courses: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/courses/<int:course_id>/students', methods=['GET'])
def get_course_students(course_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT u.id, u.name, u.email, ce.enrollment_date
            FROM users u
            JOIN course_enrollments ce ON u.id = ce.student_id
            WHERE ce.course_id = ? AND u.role = 'student'
            ORDER BY u.name
        ''', (course_id,))
        students = cursor.fetchall()
        conn.close()
        return jsonify(students)
    except Exception as e:
        logging.error(f"Error fetching course students: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                complaints.*,
                users.name as student_name
            FROM complaints
            JOIN users ON users.id = complaints.student_id
            ORDER BY created_at DESC
        ''')
        complaints = cursor.fetchall()
        conn.close()
        return jsonify(complaints)
    except Exception as e:
        logging.error(f"Error fetching complaints: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        student_id = data.get('student_id')
        title = data.get('title')
        description = data.get('description')
        category = data.get('category')

        if not all([student_id, title, description, category]):
            return jsonify({'error': 'All fields are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO complaints (student_id, title, description, category, status)
            VALUES (?, ?, ?, ?, 'Pending')
        ''', (student_id, title, description, category))
        
        complaint_id = cursor.lastrowid
        conn.commit()

        # Fetch the created complaint
        cursor.execute('''
            SELECT complaints.*, users.name as student_name
            FROM complaints 
            JOIN users ON users.id = complaints.student_id
            WHERE complaints.id = ?
        ''', (complaint_id,))
        new_complaint = cursor.fetchone()
        conn.close()

        if new_complaint:
            # Emit WebSocket event for admin notification
            socketio.emit('new_complaint', {
                'id': new_complaint['id'],
                'studentName': new_complaint['student_name'],
                'title': title,
                'category': category,
                'status': 'Pending',
                'createdAt': new_complaint['created_at']
            })
            
            return jsonify(new_complaint), 201
        else:
            return jsonify({'error': 'Failed to create complaint'}), 500

    except Exception as e:
        logging.error(f"Error creating complaint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/complaints/<int:complaint_id>/respond', methods=['POST'])
def respond_to_complaint(complaint_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        response = data.get('response')
        status = data.get('status')

        if not all([response, status]):
            return jsonify({'error': 'Response and status are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update complaint with response and new status
        cursor.execute('''
            UPDATE complaints 
            SET response = ?, status = ?, updated_at = CURRENT_TIMESTAMP,
                resolved_at = CASE WHEN ? = 'Resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
            WHERE id = ?
        ''', (response, status, status, complaint_id))
        
        conn.commit()
        
        # Get the updated record
        cursor.execute('''
            SELECT * FROM complaints WHERE id = ?
        ''', (complaint_id,))
        updated_complaint = cursor.fetchone()
        conn.close()
        
        if updated_complaint:
            # Emit WebSocket event
            socketio.emit('complaint_update', {
                'id': complaint_id,
                'status': status,
                'response': response,
                'updatedAt': updated_complaint['updated_at']
            })
            return jsonify({
                'message': 'Complaint updated successfully',
                'updated_at': updated_complaint['updated_at']
            })
        else:
            return jsonify({'error': 'Complaint not found'}), 404
            
    except Exception as e:
        logging.error(f"Error responding to complaint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=3000)