from flask import Flask, render_template, request, url_for, redirect, jsonify
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
app.secret_key = "testing"  # Secret key for session (not used in JWT)
JWT_SECRET = "your_jwt_secret_key"  # Secret key for JWT
JWT_EXPIRATION_TIME = 120  # Token expiration time in seconds

def MongoDB():
    client = MongoClient('mongodb://localhost:27017')
    db = client['flask_Auth_app']
    records = db.register
    return records

records = MongoDB()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            kwargs['user_data'] = data  # Pass decoded user data to the route
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated_function

@app.route("/", methods=['POST', 'GET'])
def index():
    message = ''
    if request.method == "POST":
        user = request.form.get("fullname")
        email = request.form.get("email")
        password1 = request.form.get("password1")
        password2 = request.form.get("password2")
        
        user_found = records.find_one({"name": user})
        email_found = records.find_one({"email": email})
        
        if user_found:
            message = 'There already is a user by that name'
            return render_template('index.html', message=message)
        if email_found:
            message = 'This email already exists in the database'
            return render_template('index.html', message=message)
        if password1 != password2:
            message = 'Passwords should match!'
            return render_template('index.html', message=message)
        else:
            hashed = bcrypt.hashpw(password2.encode('utf-8'), bcrypt.gensalt())
            user_input = {'name': user, 'email': email, 'password': hashed}
            records.insert_one(user_input)
            return jsonify({
            'status': 'Data is posted to MongoDB!',
            'name': user,
            'email': email,
        })
            # return redirect(url_for("login"))
    
    return render_template('index.html')

@app.route("/login", methods=["POST", "GET"])
def login():
    message = 'Please login to your account'
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        email_found = records.find_one({"email": email})
        if email_found:
            email_val = email_found['email']
            passwordcheck = email_found['password']

            if bcrypt.checkpw(password.encode('utf-8'), passwordcheck):
                # Set the token expiration time
                expiration_time = datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION_TIME)

                # Generate JWT token with 'exp' claim
                token = jwt.encode({'email': email_val, 'exp': expiration_time}, JWT_SECRET, algorithm='HS256')
                return jsonify({'token': token, 'expires_in': JWT_EXPIRATION_TIME})
            else:
                message = 'Wrong password'
                return jsonify({'message': message}), 401
        else:
            message = 'Email not found'
            return jsonify({'message': message}), 401
    return render_template('login.html', message=message)

@app.route('/logged_in')
@login_required
def logged_in(user_data):
    email = user_data['email']
    return jsonify({'message': 'Successfully logged in', 'email': email})

@app.route("/logout", methods=["POST", "GET"])
def logout():
    return jsonify({'message': 'Logout successful'})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
