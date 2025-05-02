from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import sqlite3
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'database.db')

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = dict_factory
        # Test the connection
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.fetchone()
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {str(e)}")
        logger.error(f"Database path: {DATABASE_PATH}")
        raise

app = Flask(__name__)

# Configure CORS to allow requests from the frontend
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": "*",  # For development only
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"]
    }
})

# Initialize Socket.IO with CORS configuration
socketio = SocketIO(app, cors_allowed_origins="*")

def init_db():
    logger.info("Initializing database...")
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Create leave_requests table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leave_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                faculty_id INTEGER NOT NULL,
                faculty_name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                leave_type TEXT NOT NULL,
                reason TEXT NOT NULL,
                status TEXT NOT NULL,
                admin_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create users table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')

        # Create courses table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                credits INTEGER NOT NULL,
                department TEXT NOT NULL,
                assigned_faculty_id INTEGER,
                instructor TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_faculty_id) REFERENCES users (id)
            )
        ''')

        # Create course_enrollments table if it doesn't exist
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

        conn.commit()
        logger.info("Database initialized successfully")
    except sqlite3.Error as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def init_sample_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if we have any courses
        cursor.execute('SELECT COUNT(*) as count FROM courses')
        count = cursor.fetchone()['count']

        if count == 0:
            # Insert sample courses
            sample_courses = [
                ('CS101', 'Introduction to Computer Science', 'Basic programming concepts and algorithms', 3, 'Computer Science'),
                ('CS201', 'Data Structures and Algorithms', 'Advanced data structures and algorithm analysis', 4, 'Computer Science'),
                ('MATH201', 'Linear Algebra', 'Vectors, matrices and linear transformations', 3, 'Mathematics'),
                ('PHY101', 'Physics I', 'Classical mechanics and thermodynamics', 4, 'Physics'),
                ('CS301', 'Database Systems', 'Database design and SQL', 3, 'Computer Science')
            ]
            
            cursor.executemany('''
                INSERT INTO courses (code, name, description, credits, department)
                VALUES (?, ?, ?, ?, ?)
            ''', sample_courses)
            
            conn.commit()
            logger.info("Sample courses added successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error initializing sample data: {str(e)}")
        if 'conn' in locals():
            conn.close()

# Initialize database when app starts
init_db()
init_sample_data()

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

        # Prevent admin registration entirely
        if role == 'admin':
            return jsonify({'error': 'Admin registration is not allowed'}), 403

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Check if email already exists
            cursor.execute('SELECT email FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                return jsonify({'error': 'Email already registered'}), 409

            # Insert the new user
            cursor.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                (name, email, password, role)
            )
            conn.commit()
            
            # Fetch the created user
            cursor.execute('SELECT id, name, email, role FROM users WHERE id = ?', (cursor.lastrowid,))
            user = cursor.fetchone()
            
            logging.debug(f"Successfully registered new {role} user: {email}")
            return jsonify(user), 201

        except sqlite3.Error as e:
            conn.rollback()
            logging.error(f"Database error during registration: {str(e)}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            conn.close()

    except Exception as e:
        logging.error(f"Error in /api/register: {str(e)}")
        return jsonify({'error': str(e) if str(e) else 'Internal server error'}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        logger.debug(f"Received login request with data: {data}")
        
        if not data:
            logger.error("No JSON data received in login request")
            return jsonify({'error': 'Invalid JSON data'}), 400
            
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not all([email, password, role]):
            logger.error(f"Missing required fields in login request. Received: {data}")
            return jsonify({'error': 'Email, password, and role are required'}), 400

        logger.debug(f"Processing login attempt for email: {email}, role: {role}")

        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # First check if user exists with given email
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            
            if not user:
                logger.debug(f"No user found with email: {email}")
                return jsonify({'error': 'Invalid credentials'}), 401
                
            # Then check if password matches
            cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
            user = cursor.fetchone()
            
            if not user:
                logger.debug(f"Invalid password for user: {email}")
                return jsonify({'error': 'Invalid credentials'}), 401
                
            # Finally check if role matches
            if user['role'] != role:
                logger.debug(f"Role mismatch. User role: {user['role']}, Requested role: {role}")
                return jsonify({'error': 'Invalid role for this user'}), 401

            logger.info(f"Login successful for user: {email}")
            
            response_data = {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'roll_number': user.get('roll_number')
            }
            
            logger.debug(f"Sending response: {response_data}")
            return jsonify(response_data)

        except Exception as e:
            logger.error(f"Database error during login: {str(e)}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Unexpected error in login route: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
        
        # Get all courses with complete information
        cursor.execute('''
            SELECT 
                id,
                code,
                name,
                description,
                credits,
                instructor,
                department
            FROM courses
            ORDER BY code ASC
        ''')
        courses = cursor.fetchall()
        conn.close()
        
        return jsonify(courses)
    except Exception as e:
        logging.error(f"Error fetching courses: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/courses', methods=['POST'])
def create_course():
    try:
        data = request.get_json()
        logger.debug(f"Received course creation request with data: {data}")
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'Invalid JSON data'}), 400

        required_fields = ['code', 'name', 'description', 'credits', 'department']
        if not all(field in data for field in required_fields):
            missing = [f for f in required_fields if f not in data]
            logger.error(f"Missing required fields: {missing}")
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if course code already exists
        cursor.execute('SELECT id FROM courses WHERE code = ?', (data['code'],))
        if cursor.fetchone():
            logger.error(f"Course code {data['code']} already exists")
            conn.close()
            return jsonify({'error': 'Course code already exists'}), 409

        logger.debug("Creating new course...")
        # Create new course
        cursor.execute('''
            INSERT INTO courses (code, name, description, credits, department)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['code'], data['name'], data['description'], data['credits'], data['department']))
        
        course_id = cursor.lastrowid
        logger.debug(f"Created course with ID: {course_id}")
        conn.commit()

        # Fetch the created course
        cursor.execute('SELECT * FROM courses WHERE id = ?', (course_id,))
        new_course = cursor.fetchone()
        conn.close()

        if new_course:
            logger.info(f"Successfully created course: {new_course}")
            return jsonify(new_course), 201
        else:
            logger.error("Failed to fetch created course")
            return jsonify({'error': 'Failed to create course'}), 500

    except sqlite3.Error as e:
        logger.error(f"Database error creating course: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error creating course: {str(e)}", exc_info=True)
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
        
        # Verify if course exists
        cursor.execute('SELECT * FROM courses WHERE id = ?', (course_id,))
        course = cursor.fetchone()
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Get search parameter from query string
        roll_number = request.args.get('roll_number', '')
        
        # Build the base query with proper joins
        query = '''
            SELECT DISTINCT
                u.id,
                u.name,
                u.email,
                u.roll_number,
                ce.enrollment_date,
                c.code as course_code,
                c.name as course_name
            FROM users u
            JOIN course_enrollments ce ON u.id = ce.student_id
            JOIN courses c ON ce.course_id = c.id
            WHERE u.role = 'student'
            AND ce.course_id = ?
            AND ce.status = 'active'
        '''
        params = [course_id]
        
        # Add roll number filter if provided
        if roll_number:
            query += ' AND u.roll_number LIKE ?'
            params.append(f'%{roll_number}%')
            
        query += ' ORDER BY u.roll_number, u.name'
        
        cursor.execute(query, params)
        students = cursor.fetchall()
        
        # Include course information in response
        result = {
            'course': course,
            'students': students
        }
        
        conn.close()
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error fetching course students: {str(e)}")
        if 'conn' in locals():
            conn.close()
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

@app.route('/api/admin/leave-requests', methods=['GET'])
def get_leave_requests():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                lr.*,
                u.name as faculty_name,
                u.email as faculty_email
            FROM leave_requests lr
            JOIN users u ON lr.faculty_id = u.id
            ORDER BY lr.created_at DESC
        ''')
        
        requests = cursor.fetchall()
        conn.close()
        return jsonify(requests)
    except Exception as e:
        logging.error(f"Error fetching leave requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/leave-requests/<int:request_id>', methods=['PUT'])
def update_leave_request(request_id):
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First get the request to get faculty_id
        cursor.execute('SELECT faculty_id FROM leave_requests WHERE id = ?', (request_id,))
        leave_request = cursor.fetchone()
        if not leave_request:
            conn.close()
            return jsonify({'error': 'Leave request not found'}), 404

        # Update the request
        cursor.execute('''
            UPDATE leave_requests 
            SET status = ?, admin_response = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (data['status'], data.get('admin_response'), request_id))
        
        conn.commit()

        # Get updated request
        cursor.execute('SELECT * FROM leave_requests WHERE id = ?', (request_id,))
        updated_request = cursor.fetchone()
        conn.close()

        if updated_request:
            # Emit Socket.IO event for faculty notification
            socketio.emit('leave_request_update', {
                'id': request_id,
                'faculty_id': leave_request['faculty_id'],
                'status': data['status'],
                'admin_response': data.get('admin_response')
            })
        
        return jsonify({'message': 'Leave request updated successfully'})
    except Exception as e:
        logging.error(f"Error updating leave request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/faculty/leave-requests/<int:faculty_id>', methods=['GET'])
def get_faculty_leave_requests(faculty_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM leave_requests 
            WHERE faculty_id = ?
            ORDER BY created_at DESC
        ''', (faculty_id,))
        
        requests = cursor.fetchall()
        conn.close()
        return jsonify(requests)
    except Exception as e:
        logging.error(f"Error fetching faculty leave requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/faculty/leave-requests', methods=['POST'])
def create_leave_request():
    try:
        data = request.get_json()
        logger.debug(f"Received leave request data: {data}")
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'Invalid JSON data'}), 400

        required_fields = ['faculty_id', 'faculty_name', 'start_date', 'end_date', 'leave_type', 'reason']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing fields in request: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Validate faculty_id is an integer
        try:
            faculty_id = int(data['faculty_id'])
            logger.debug(f"Converted faculty_id to int: {faculty_id}")
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid faculty_id format: {data['faculty_id']}, error: {str(e)}")
            return jsonify({'error': 'Invalid faculty_id format'}), 400

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Verify faculty exists
            cursor.execute('SELECT id FROM users WHERE id = ? AND role = "faculty"', (faculty_id,))
            faculty = cursor.fetchone()
            if not faculty:
                logger.error(f"Faculty not found with id: {faculty_id}")
                return jsonify({'error': 'Faculty not found'}), 404

            logger.info(f"Found faculty with id: {faculty_id}")

            # Create new request
            insert_query = '''
                INSERT INTO leave_requests (
                    faculty_id, faculty_name, start_date, end_date, 
                    leave_type, reason, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)
            '''
            insert_params = (
                faculty_id, data['faculty_name'], data['start_date'],
                data['end_date'], data['leave_type'], data['reason']
            )
            logger.debug(f"Executing insert query with params: {insert_params}")
            
            cursor.execute(insert_query, insert_params)
            request_id = cursor.lastrowid
            conn.commit()
            logger.info(f"Created leave request with id: {request_id}")

            # Fetch the created request
            cursor.execute('SELECT * FROM leave_requests WHERE id = ?', (request_id,))
            new_request = cursor.fetchone()
            
            if new_request:
                logger.info(f"Successfully fetched new request: {new_request}")
                # Convert datetime objects to string to ensure JSON serializable
                new_request_dict = dict(new_request)
                new_request_dict['created_at'] = str(new_request_dict.get('created_at'))
                new_request_dict['updated_at'] = str(new_request_dict.get('updated_at'))
                
                # Emit Socket.IO event for admin notification
                socketio.emit('new_leave_request', {
                    'id': new_request_dict['id'],
                    'faculty_name': data['faculty_name'],
                    'start_date': data['start_date'],
                    'end_date': data['end_date'],
                    'leave_type': data['leave_type'],
                    'status': 'Pending'
                })
                
                return jsonify(new_request_dict), 201
            else:
                logger.error("Failed to fetch created request")
                return jsonify({'error': 'Failed to create request'}), 500

        except sqlite3.Error as e:
            logger.error(f"Database error: {str(e)}")
            if 'conn' in locals():
                conn.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        finally:
            if 'conn' in locals():
                conn.close()

    except Exception as e:
        logger.error(f"Unexpected error creating leave request: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/faculty-assignments', methods=['GET'])
def get_faculty_assignments():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all courses with their assigned faculty
        cursor.execute('''
            SELECT c.id, c.code, c.name, c.department, c.credits, 
                   c.assigned_faculty_id, u.name as faculty_name
            FROM courses c
            LEFT JOIN users u ON c.assigned_faculty_id = u.id
            WHERE u.role = 'faculty' OR u.role IS NULL
        ''')
        
        courses = cursor.fetchall()
        
        # Get all faculty members
        cursor.execute('SELECT id, name, email, department FROM users WHERE role = "faculty"')
        faculty = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'courses': courses,
            'faculty': faculty
        })
    except Exception as e:
        logger.error(f"Error getting faculty assignments: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/faculty-assignments/<int:course_id>', methods=['PUT'])
def assign_faculty(course_id):
    try:
        data = request.get_json()
        faculty_id = data.get('facultyId')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update course assignment
        cursor.execute('''
            UPDATE courses 
            SET assigned_faculty_id = ?
            WHERE id = ?
        ''', (faculty_id, course_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Faculty assigned successfully'})
    except Exception as e:
        logger.error(f"Error assigning faculty: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=3000)