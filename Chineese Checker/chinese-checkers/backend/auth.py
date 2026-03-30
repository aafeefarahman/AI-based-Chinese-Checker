import sqlite3
import hashlib
import os
from flask import Blueprint, request, jsonify
from contextlib import contextmanager

auth_bp = Blueprint("auth", __name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")  # prevents locking
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0
            )
        """)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

init_db()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, hash_password(password))
            )
        return jsonify({"message": "Registration successful", "username": username}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, hash_password(password))
        ).fetchone()

    if user:
        return jsonify({
            "message": "Login successful",
            "username": user["username"],
            "wins": user["wins"],
            "losses": user["losses"]
        })
    return jsonify({"error": f'"{username}" exists but password is wrong, or user not found'}), 401

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out"})
