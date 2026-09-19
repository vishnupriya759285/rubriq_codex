"""Create or update a student account for Arun (Machine Learning Exam, 25.7/44) and release his exam submission."""

from datetime import datetime, timezone
import sqlite3
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))
from app.auth import hash_password

DB_PATH = backend_dir / "data" / "rubriq.db"

DEFAULT_EMAIL = "arun@rubriq.edu"
DEFAULT_PASSWORD = "password123"

def setup_arun():
    pwd_hash = hash_password(DEFAULT_PASSWORD)
    now_iso = datetime.now(timezone.utc).isoformat()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Specifically find student Arun who took the Machine Learning Exam (25.7/44)
    student_row = c.execute("""
        SELECT s.id, s.name, s.identifier, sub.id, sub.exam_id, sub.total_score, sub.status, e.title, e.total_marks
        FROM students s
        JOIN submissions sub ON sub.student_id = s.id
        JOIN exams e ON e.id = sub.exam_id
        WHERE sub.total_score > 0
        ORDER BY sub.created_at DESC
        LIMIT 1
    """).fetchone()

    if not student_row:
        print("No submission found!")
        return

    student_id = student_row[0]
    student_name = student_row[1]
    identifier = student_row[2]
    submission_id = student_row[3]
    total_score = student_row[5]
    status = student_row[6]
    exam_title = student_row[7]
    total_marks = student_row[8]

    print(f"Target Student: {student_name} ({identifier}), ID: {student_id}")
    print(f"Exam: {exam_title}, Score: {total_score}/{total_marks}, Status: {status}")

    # 1. Release the submission so it appears on Arun's dashboard
    c.execute("""
        UPDATE submissions
        SET released_at = ?
        WHERE id = ?
    """, (now_iso, submission_id))
    print(f"Released submission {submission_id} (released_at = {now_iso})")

    # 2. Link or create the Account for this specific student
    # Remove any previous test account with this email
    c.execute("DELETE FROM accounts WHERE email = ?", (DEFAULT_EMAIL,))

    import uuid
    acc_id = str(uuid.uuid4())
    c.execute("""
        INSERT INTO accounts (id, email, password_hash, role, student_id, must_change_password, disabled_at)
        VALUES (?, ?, ?, 'STUDENT', ?, 0, NULL)
    """, (acc_id, DEFAULT_EMAIL, pwd_hash, student_id))
    print(f"Created Account {acc_id}:")
    print(f"  Email: {DEFAULT_EMAIL}")
    print(f"  Password: {DEFAULT_PASSWORD}")
    print(f"  Role: STUDENT")
    print(f"  Linked Student: {student_name} ({student_id})")

    conn.commit()

    # Also check what /api/student/profile and /api/student/submissions will see
    profile_check = c.execute("""
        SELECT s.id, s.name, sub.id, sub.total_score, sub.released_at
        FROM students s
        JOIN submissions sub ON sub.student_id = s.id
        WHERE s.id = ? AND sub.released_at IS NOT NULL
    """, (student_id,)).fetchall()
    print("Verified released submissions for Arun:", profile_check)

    conn.close()

if __name__ == "__main__":
    setup_arun()
