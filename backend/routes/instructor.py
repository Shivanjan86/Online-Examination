from flask import Blueprint, request, jsonify
from db_config import get_db_connection
import mysql.connector

instructor_bp = Blueprint('instructor', __name__, url_prefix='/instructor')

# Add Question to Question Bank
@instructor_bp.route('/questionbank', methods=['POST'])
def add_to_question_bank():
    data = request.get_json() or {}
    question_text = data.get('questiontext')
    options = data.get('options')
    correct_option_index = data.get('correctOptionIndex')
    instructor_id = data.get('instructorid')
    if not all([question_text, options, correct_option_index is not None, instructor_id]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        sql_question = "INSERT INTO QuestionBank (instructorid, questiontext) VALUES (%s, %s)"
        cursor.execute(sql_question, (instructor_id, question_text))
        new_question_id = cursor.lastrowid
        sql_option = "INSERT INTO Options (questionid, optiontext, iscorrect) VALUES (%s, %s, %s)"
        for i, option_text in enumerate(options):
            is_correct = (i == correct_option_index)
            cursor.execute(sql_option, (new_question_id, option_text, is_correct))
        conn.commit()
        return jsonify({"status": "success", "message": "Question added", "question_id": new_question_id}), 201
    except Exception as err:
        conn.rollback()
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Get Courses Assigned to Instructor
@instructor_bp.route('/courses/<int:instructorid>', methods=['GET'])
def get_instructor_course(instructorid):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, title FROM Course WHERE instructorid = %s", (instructorid,))
        course = cursor.fetchone() 
        return jsonify(course), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Get Instructor's Question Bank
@instructor_bp.route('/questionbank/<int:instructorid>', methods=['GET'])
def get_instructor_question_bank(instructorid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, questiontext FROM QuestionBank WHERE instructorid = %s", (instructorid,))
        questions = cursor.fetchall()
        return jsonify(questions), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Create Exam
@instructor_bp.route('/exams', methods=['POST'])
def create_exam():
    data = request.get_json() or {}
    courseid = data.get('courseid')
    title = data.get('title')
    starttime = data.get('starttime')
    endtime = data.get('endtime')
    questions = data.get('questions')
    if not all([courseid, title, starttime, endtime, questions]):
         return jsonify({"status": "error", "message": "Missing required fields"}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        sql_exam = "INSERT INTO Exam (courseid, title, starttime, endtime) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql_exam, (courseid, title, starttime, endtime))
        new_exam_id = cursor.lastrowid
        sql_exam_question = "INSERT INTO ExamQuestions (examid, questionid, marks) VALUES (%s, %s, %s)"
        for q in questions:
            cursor.execute(sql_exam_question, (new_exam_id, q.get('questionid'), q.get('marks')))
        conn.commit()
        return jsonify({"status": "success", "message": "Exam created successfully", "exam_id": new_exam_id}), 201
    except Exception as err:
        conn.rollback()
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Get All Exams for Instructor
@instructor_bp.route('/<int:instructorid>/exams', methods=['GET'])
def get_instructor_exams(instructorid):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT e.id, e.title, c.title AS coursetitle, e.starttime
            FROM Exam e
            JOIN Course c ON e.courseid = c.id
            WHERE c.instructorid = %s
            ORDER BY e.starttime DESC;
        """
        cursor.execute(query, (instructorid,))
        exams = cursor.fetchall()
        
        for exam in exams:
            if exam['starttime']:
                exam['starttime'] = exam['starttime'].isoformat()
        
        
        return jsonify(exams), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

#  Get Detailed Exam Results 
@instructor_bp.route('/exam/<int:examid>/results', methods=['GET'])
def get_exam_results(examid):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                s.name AS studentname,
                a.id AS attemptid,
                a.score,
                a.attempttime,
                getExamTotalMarks(a.examid) AS totalmarks
            FROM Attempt a
            JOIN Student s ON a.studentid = s.id
            WHERE a.examid = %s
            ORDER BY a.score DESC, a.attempttime ASC;
        """
        cursor.execute(query, (examid,))
        attempts = cursor.fetchall()

       
        for attempt in attempts:
            if attempt['attempttime']:
                attempt['attempttime'] = attempt['attempttime'].isoformat()
        

        return jsonify(attempts), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()