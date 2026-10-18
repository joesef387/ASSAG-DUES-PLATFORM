from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import sqlite3
import uuid
import requests
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

app = Flask(__name__)
CORS(app)

load_dotenv(dotenv_path=ENV_FILE)

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
DATABASE_PATH = BASE_DIR / "database.db"


def create_database():
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS dues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            level TEXT NOT NULL,
            membership TEXT NOT NULL,
            semester TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            payment_reference TEXT
        )
        """
    )

    connection.commit()

    try:
        cursor.execute("ALTER TABLE dues ADD COLUMN payment_reference TEXT")
        connection.commit()
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE dues ADD COLUMN email TEXT")
        connection.commit()
    except sqlite3.OperationalError:
        pass

    connection.close()


@app.route("/api/dues", methods=["POST"])
def save_dues():
    data = request.get_json(silent=True) or {}

    full_name = data.get("fullName")
    student_id = data.get("studentId")
    email = data.get("email")
    level = data.get("level")
    membership = data.get("membership")
    semester = data.get("semester")
    amount = data.get("amount")

    if not full_name or not student_id or not email or not level or not membership or not semester:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()
    payment_reference = "ASSA-" + uuid.uuid4().hex[:8].upper()

    cursor.execute(
        """
        INSERT INTO dues
        (full_name, student_id, level, membership, semester, amount, status, payment_reference, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            full_name,
            student_id,
            level,
            membership,
            semester,
            amount,
            "Pending",
            payment_reference,
            email,
        ),
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Dues record saved successfully.",
        "payment_reference": payment_reference,
    })


@app.route("/api/dues", methods=["GET"])
def get_dues():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM dues")
    records = cursor.fetchall()
    connection.close()

    return jsonify([dict(record) for record in records])


@app.route("/api/payment/initialize", methods=["POST"])
def initialize_payment():

    data = request.get_json()

    email = data.get("email")
    amount = data.get("amount")
    reference = data.get("reference")

    if not email or not amount or not reference:
        return jsonify({
            "success": False,
            "message": "Email, amount and reference are required."
        }), 400

    amount_in_pesewas = int(float(amount) * 100)

    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "email": email,
        "amount": amount_in_pesewas,
        "currency": "GHS",
        "reference": reference
    }

    try:

        response = requests.post(
            "https://api.paystack.co/transaction/initialize",
            json=payload,
            headers=headers
        )

        result = response.json()

        if response.status_code == 200 and result.get("status"):

            return jsonify({
                "success": True,
                "authorization_url": result["data"]["authorization_url"],
                "reference": result["data"]["reference"]
            })

        return jsonify({
            "success": False,
            "message": result.get("message", "Payment initialization failed.")
        }), 400

    except requests.RequestException as error:

        print(error)

        return jsonify({
            "success": False,
            "message": "Unable to connect to Paystack."
        }), 500


@app.route("/")
def home():
    return "ASSA Dues Platform Backend is running!"


if __name__ == "__main__":
    create_database()
    app.run(debug=True)