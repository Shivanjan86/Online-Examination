# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from db_config import get_db_connection

# # 1. Import the blueprint
# from routes.instructor import instructor_bp 
# from routes.student import student_bp  

# app = Flask(__name__)
# CORS(app) 

# # (Your existing /login route) ...
# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     conn = get_db_connection()
#     if not conn:
#         return jsonify({"status": "error", "message": "Database connection failed"}), 500

#     cursor = conn.cursor(dictionary=True)
    
#     cursor.execute("SELECT id, name FROM Student WHERE email = %s AND password = %s", (email, password))
#     user = cursor.fetchone()
    
#     if user:
#         cursor.close()
#         conn.close()
#         return jsonify({
#             "status": "success", 
#             "role": "student", 
#             "id": user['id'], 
#             "name": user['name']
#         })

#     cursor.execute("SELECT id, name FROM Instructor WHERE email = %s AND password = %s", (email, password))
#     user = cursor.fetchone()
    
#     if user:
#         cursor.close()
#         conn.close()
#         return jsonify({
#             "status": "success", 
#             "role": "instructor", 
#             "id": user['id'], 
#             "name": user['name']
#         })

#     cursor.close()
#     conn.close()
#     return jsonify({"status": "error", "message": "Invalid email or password"}), 401

# # 2. Register the instructor blueprint
# # All routes in instructor_bp will now be active under '/instructor'
# # e.g., /instructor/questionbank
# app.register_blueprint(instructor_bp)
# app.register_blueprint(student_bp)

# if __name__ == '__main__':
#     # Make sure to set port=5000 to match the frontend
#     app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
from db_config import get_db_connection

# 1. Import the blueprint
from routes.instructor import instructor_bp 
from routes.student import student_bp  

app = Flask(__name__)
CORS(app) 

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id, name FROM Student WHERE email = %s AND password = %s", (email, password))
    user = cursor.fetchone()
    
    if user:
        cursor.close()
        conn.close()
        return jsonify({
            "status": "success", 
            "role": "student", 
            "id": user['id'], 
            "name": user['name']
        })

    cursor.execute("SELECT id, name FROM Instructor WHERE email = %s AND password = %s", (email, password))
    user = cursor.fetchone()
    
    if user:
        cursor.close()
        conn.close()
        return jsonify({
            "status": "success", 
            "role": "instructor", 
            "id": user['id'], 
            "name": user['name']
        })

    cursor.close()
    conn.close()
    return jsonify({"status": "error", "message": "Invalid email or password"}), 401

# 2. Register the instructor blueprint
# All routes in instructor_bp will now be active under '/instructor'
# e.g., /instructor/questionbank
app.register_blueprint(instructor_bp)
app.register_blueprint(student_bp)

if __name__ == '__main__':
    # Make sure to set port=5000 to match the frontend
    app.run(debug=True, port=5000)