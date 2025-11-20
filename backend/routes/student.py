from flask import Blueprint, request, jsonify
from db_config import get_db_connection
import datetime
import mysql.connector

student_bp = Blueprint('student', __name__, url_prefix='/student')

# Get the Student Dashboard 
@student_bp.route('/dashboard/<int:studentid>', methods=['GET'])
def get_student_dashboard(studentid):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT 
            e.id AS examid,
            e.title AS examtitle,
            e.starttime,
            e.endtime,
            c.title AS coursetitle,
            MAX(a.id) AS attemptid,
            MAX(a.score) AS score
        FROM Enrollment en
        JOIN Course c ON en.courseid = c.id
        JOIN Exam e ON e.courseid = c.id
        LEFT JOIN Attempt a ON a.examid = e.id AND a.studentid = en.studentid
        WHERE en.studentid = %s
        GROUP BY e.id, e.title, e.starttime, e.endtime, c.title
        ORDER BY e.starttime DESC;
    """
    
    try:
        cursor.execute(query, (studentid,))
        exams = cursor.fetchall()
        
        dashboard_data = []
        for exam in exams:
            status = ""
            now = datetime.datetime.now()
            
            starttime_obj = exam['starttime']
            endtime_obj = exam['endtime']
            
          
            if starttime_obj:
                exam['starttime'] = starttime_obj.isoformat()
            if endtime_obj:
                exam['endtime'] = endtime_obj.isoformat()

            if exam['attemptid']:
                status = "Completed"
            elif starttime_obj and now < starttime_obj:
                status = "Upcoming"
            elif endtime_obj and now > endtime_obj:
                status = "Past"
            else:
                status = "Active"
                
            exam['status'] = status
            dashboard_data.append(exam)
            
        return jsonify(dashboard_data), 200
        
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

#   Start an Exam
@student_bp.route('/exams/<int:examid>/start', methods=['POST'])
def start_exam(examid):
    data = request.get_json() or {}
    studentid = data.get('studentid')
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM Attempt WHERE studentid = %s AND examid = %s", (studentid, examid))
        existing_attempt = cursor.fetchone() 
        
        if existing_attempt:
            return jsonify({"status": "success", "attemptid": existing_attempt[0]}), 200

        cursor.execute("INSERT INTO Attempt (studentid, examid) VALUES (%s, %s)", (studentid, examid))
        new_attempt_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({"status": "success", "attemptid": new_attempt_id}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        
        if err.errno == 1644: 
             return jsonify({"status": "error", "message": err.msg}), 403
        if err.errno == 1062:
            cursor.execute("SELECT id FROM Attempt WHERE studentid = %s AND examid = %s", (studentid, examid))
            existing_attempt = cursor.fetchone()
            if existing_attempt:
                 return jsonify({"status": "success", "attemptid": existing_attempt[0]}), 200
        
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "Failed to start attempt"}), 500
    finally:
        cursor.close()
        conn.close()

# Get Questions for an Exam Attempt
@student_bp.route('/attempt/<int:attemptid>/questions', methods=['GET'])
def get_exam_questions(attemptid):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT e.title AS examtitle, e.endtime
            FROM Attempt a
            JOIN Exam e ON a.examid = e.id
            WHERE a.id = %s;
        """, (attemptid,))
        exam_details = cursor.fetchone()

        if not exam_details:
            return jsonify({"status": "error", "message": "Attempt not found"}), 404
        
    
        if exam_details['endtime']:
            exam_details['endtime'] = exam_details['endtime'].isoformat()


        query = """
            SELECT 
                qb.id AS questionid, qb.questiontext,
                o.id AS optionid, o.optiontext
            FROM Attempt a
            JOIN ExamQuestions eq ON a.examid = eq.examid
            JOIN QuestionBank qb ON eq.questionid = qb.id
            JOIN Options o ON o.questionid = qb.id
            WHERE a.id = %s
            ORDER BY qb.id, o.id;
        """
        cursor.execute(query, (attemptid,))
        results = cursor.fetchall()
        
        questions = {}
        for row in results:
            if row['questionid'] not in questions:
                questions[row['questionid']] = {
                    "questionid": row['questionid'],
                    "questiontext": row['questiontext'],
                    "options": []
                }
            questions[row['questionid']]['options'].append({
                "optionid": row['optionid'],
                "optiontext": row['optiontext']
            })
        
        return jsonify({
            "examDetails": exam_details,
            "questions": list(questions.values())
        }), 200
        
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Submit a Single Answer 
@student_bp.route('/submit', methods=['POST'])
def submit_answer():
    data = request.get_json() or {}
    attemptid = data.get('attemptid')
    questionid = data.get('questionid')
    selectedoptionid = data.get('selectedoptionid')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('submitAnswer', (attemptid, questionid, selectedoptionid))
        conn.commit()
        return jsonify({"status": "success", "message": "Answer saved"}), 200
    except Exception as err:
        conn.rollback()
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()


@student_bp.route('/attempt/<int:attemptid>/finish', methods=['POST'])
def finish_exam(attemptid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Score is automatically calculated by trigger, just read it
        cursor.execute("SELECT score FROM Attempt WHERE id = %s", (attemptid,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"status": "error", "message": "Attempt not found"}), 404
        
        final_score = result['score']
        return jsonify({"status": "success", "message": "Exam finished", "finalScore": final_score}), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# Get Results for a Single Attempt 
@student_bp.route('/attempt/<int:attemptid>/results', methods=['GET'])
def get_attempt_results(attemptid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        summary_query = """
            SELECT 
                a.score, 
                e.title AS examtitle, 
                getExamTotalMarks(a.examid) AS totalmarks
            FROM Attempt a
            JOIN Exam e ON a.examid = e.id
            WHERE a.id = %s;
        """
        cursor.execute(summary_query, (attemptid,))
        summary = cursor.fetchone()
        if not summary:
            return jsonify({"status": "error", "message": "Attempt not found"}), 404

        details_query = """
            SELECT 
                qb.questiontext,
                o_selected.optiontext AS selectedanswer,
                o_correct.optiontext AS correctanswer,
                o_selected.iscorrect
            FROM Submission s
            JOIN QuestionBank qb ON s.questionid = qb.id
            JOIN Options o_selected ON s.selectedoptionid = o_selected.id
            JOIN Options o_correct ON qb.id = o_correct.questionid AND o_correct.iscorrect = TRUE
            WHERE s.attemptid = %s
            ORDER BY qb.id;
        """
        cursor.execute(details_query, (attemptid,))
        details = cursor.fetchall()

        return jsonify({"status": "success", "summary": summary, "details": details}), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"status": "error", "message": "An error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

