"""Comprehensive End-to-End Real User Flow Test for Campus Knowledge Network.

Executes the exact 22-step flow across Student, Senior/Mentor, and Admin accounts.
"""

import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def create_authed_client():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    def add_csrf(request: httpx.Request):
        csrf = client.cookies.get("rubriq_csrf")
        if csrf and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            request.headers["X-CSRF-Token"] = csrf
    client.event_hooks["request"] = [add_csrf]
    return client


def run_test():
    print("=================================================================")
    print("STARTING REAL USER TEST: STUDENT + MENTOR + ADMIN FLOW")
    print("=================================================================")

    # Step 1: Admin logs in
    admin_client = create_authed_client()
    admin_login_resp = admin_client.post("/api/auth/login", json={
        "email": "admin@rubriq.edu",
        "password": "Admin@123456"
    })
    assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
    admin_me = admin_client.get("/api/auth/me").json()
    assert admin_me["role"] == "admin", f"Expected admin role, got: {admin_me}"
    print(f"Step 1 PASS: Admin logged in successfully ({admin_me['name']}, role: {admin_me['role']})")

    # Step 2: Mentor signs up & creates profile
    mentor_client = create_authed_client()
    mentor_signup_resp = mentor_client.post("/api/auth/signup", json={
        "name": "Arjun Sharma",
        "email": "arjun.senior@rubriq.edu",
        "password": "Mentor@123456",
        "role": "student",
        "identifier": "SR-CSE-2022"
    })
    # If already exists from earlier test, login instead
    if mentor_signup_resp.status_code == 409:
        login_r = mentor_client.post("/api/auth/login", json={
            "email": "arjun.senior@rubriq.edu",
            "password": "Mentor@123456"
        })
        assert login_r.status_code == 200, f"Mentor login failed: {login_r.text}"
    else:
        assert mentor_signup_resp.status_code == 201, f"Mentor signup failed: {mentor_signup_resp.text}"

    # Mentor creates profile
    mentor_profile_resp = mentor_client.post("/api/network/profile/me", json={
        "display_name": "Arjun Sharma",
        "display_role": "Senior Student",
        "department": "Computer Science & Engineering",
        "year_or_batch": "4th Year (Batch 2022-2026)",
        "bio": "Specialized in Computer Vision, Machine Learning, and Hackathons. Happy to guide on Bayes theorem and final-year ML projects.",
        "skills": ["Python", "PyTorch", "OpenCV", "Probability & Statistics"],
        "mentoring_topics": ["Bayes theorem", "Probability", "Computer Vision", "Hackathons"],
        "availability": "Weekdays 4-6 PM",
        "projects": [
            {"title": "Autonomous Vision Inspection", "description": "Edge-deployed object perception CNN", "link": "https://github.com/arjun/vision"}
        ],
        "linkedin_url": "https://linkedin.com/in/arjun-senior",
        "github_url": "https://github.com/arjun"
    })
    assert mentor_profile_resp.status_code == 200, f"Create mentor profile failed: {mentor_profile_resp.text}"
    mentor_profile = mentor_profile_resp.json()
    mentor_id = mentor_profile["id"]
    print(f"Step 2 PASS: Mentor profile created ({mentor_profile['name']}, ID: {mentor_id})")

    # Step 3: Mentor selects expertise to apply for verification
    cats = mentor_client.get("/api/network/categories").json()
    ai_cat = next((c for c in cats if c["slug"] == "ai-ml"), cats[0])
    
    exp_apply_resp = mentor_client.post("/api/network/profile/me/expertise", json={
        "category_id": ai_cat["id"],
        "concept_tag": "Probability"
    })
    # If already applied, retrieve it
    if exp_apply_resp.status_code == 409:
        my_p = mentor_client.get("/api/network/profile/me").json()
        exp_id = next(e["id"] for e in my_p["expertises"] if e["concept_tag"] == "Probability")
    else:
        assert exp_apply_resp.status_code == 201, f"Expertise apply failed: {exp_apply_resp.text}"
        exp_id = exp_apply_resp.json()["id"]
    print(f"Step 3 PASS: Mentor applied for 'Probability' expertise verification (ID: {exp_id})")

    # Step 4: Admin verifies expertise
    admin_verify_resp = admin_client.patch(f"/api/network/admin/verifications/{exp_id}", json={
        "status": "verified",
        "review_notes": "Verified based on academic records and GitHub portfolio."
    })
    assert admin_verify_resp.status_code == 200, f"Admin verify failed: {admin_verify_resp.text}"
    print("Step 4 PASS: Admin verified expertise! Badge is now officially stored in DB.")

    # Step 5: Student logs in
    student_client = create_authed_client()
    student_signup_resp = student_client.post("/api/auth/signup", json={
        "name": "Rahul Verma",
        "email": "rahul.student@rubriq.edu",
        "password": "Student@123456",
        "role": "student",
        "identifier": "STU-2024-001"
    })
    if student_signup_resp.status_code == 409:
        login_r = student_client.post("/api/auth/login", json={
            "email": "rahul.student@rubriq.edu",
            "password": "Student@123456"
        })
        assert login_r.status_code == 200
    else:
        assert student_signup_resp.status_code == 201
    student_me = student_client.get("/api/auth/me").json()
    print(f"Step 5 PASS: Student logged in ({student_me['name']})")

    # Step 6: Check student assessment / learning gaps
    # (Student profile endpoint returns real assessment concepts)
    student_profile = student_client.get("/api/student/profile")
    assert student_profile.status_code == 200, f"Student profile error: {student_profile.text}"
    print("Step 6 PASS: Student assessment learning gaps accessed.")

    # Step 7 & 8: Student searches for "I don't understand Bayes theorem and probability"
    match_resp = student_client.post("/api/network/match", json={
        "query": "I don't understand Bayes theorem and probability",
        "concept_tag": "Probability"
    })
    assert match_resp.status_code == 200, f"Match request failed: {match_resp.text}"
    match_data = match_resp.json()
    
    # Step 9: Real verified mentor appears
    matched = match_data["matched_mentors"]
    assert len(matched) > 0, "Expected at least 1 verified mentor to appear!"
    found_arjun = next((m for m in matched if m["name"] == "Arjun Sharma"), None)
    assert found_arjun is not None, "Arjun Sharma was not returned in search results!"
    assert any("Probability" in b["concept_tag"] for b in found_arjun["verified_badges"]), "Expected verified Probability badge!"
    reason_safe = (found_arjun.get('match_reason') or '').replace('\u2713', '[VERIFIED]')
    print(f"Steps 7, 8, 9 PASS: Search matched verified mentor {found_arjun['name']}! Reason: {reason_safe}")

    # Step 10: Student asks an anonymous question
    ask_resp = student_client.post("/api/network/questions", json={
        "title": "How do I approach Bayes theorem in Machine Learning?",
        "body": "I understand conditional probability but get confused when updating priors with likelihood evidence. Could someone guide me?",
        "mode": "anonymous",
        "target_mentor_id": mentor_id,
        "concept_tag": "Probability"
    })
    assert ask_resp.status_code == 201, f"Ask question failed: {ask_resp.text}"
    question_data = ask_resp.json()
    question_id = question_data["id"]
    assert question_data["author_display"] == "You (Anonymous Student)", "Author should see anonymous label!"
    print(f"Step 10 PASS: Student posted anonymous question (ID: {question_id})")

    # Step 11: Mentor receives a real notification
    mentor_notifs_resp = mentor_client.get("/api/network/notifications")
    assert mentor_notifs_resp.status_code == 200
    m_notifs = mentor_notifs_resp.json()["items"]
    found_q_notif = next((n for n in m_notifs if "Bayes" in n["title"] or "Bayes" in n["body"]), None)
    assert found_q_notif is not None, f"Mentor did not receive question notification! Items: {m_notifs}"
    print(f"Step 11 PASS: Mentor received real DB notification: '{found_q_notif['title']}'")

    # Step 12: Mentor replies
    reply_resp = mentor_client.post(f"/api/network/questions/{question_id}/responses", json={
        "body": "Think of the prior as your baseline belief, and the likelihood as the evidence score from data. Multiplying them and normalizing gives the posterior. Let's connect if you'd like a step-by-step example!"
    })
    assert reply_resp.status_code == 201, f"Reply failed: {reply_resp.text}"
    print("Step 12 PASS: Mentor replied to anonymous question.")

    # Step 13: Student receives the response
    student_q_detail = student_client.get(f"/api/network/questions/{question_id}").json()
    assert len(student_q_detail["responses"]) >= 1, "Student did not see mentor's response!"
    assert student_q_detail["responses"][0]["responder_name"] == "Arjun Sharma"
    print(f"Step 13 PASS: Student received response from {student_q_detail['responses'][0]['responder_name']}")

    # Step 14: Student requests connection
    conn_req_resp = student_client.post("/api/network/connections", json={
        "mentor_account_id": found_arjun["account_id"],
        "concept_tag": "Probability",
        "note": "Hi Arjun, thank you for your helpful reply on Bayes theorem. I'd love to connect for ML mentorship."
    })
    assert conn_req_resp.status_code in {201, 409}, f"Connection request failed: {conn_req_resp.text}"
    
    # Retrieve connection id
    all_conns = mentor_client.get("/api/network/connections").json()["items"]
    target_conn = next(c for c in all_conns if c["concept_tag"] == "Probability")
    conn_id = target_conn["id"]
    print(f"Step 14 PASS: Student requested connection (ID: {conn_id})")

    # Step 15: Mentor accepts
    accept_resp = mentor_client.patch(f"/api/network/connections/{conn_id}", json={
        "status": "accepted"
    })
    assert accept_resp.status_code == 200, f"Accept failed: {accept_resp.text}"
    print("Step 15 PASS: Mentor accepted connection!")

    # Step 16: Real conversation starts
    msg1 = student_client.post(f"/api/network/conversations/{conn_id}/messages", json={
        "body": "Hi Arjun! Thank you for accepting my mentorship connection."
    })
    assert msg1.status_code == 201, f"Message 1 failed: {msg1.text}"

    msg2 = mentor_client.post(f"/api/network/conversations/{conn_id}/messages", json={
        "body": "Welcome Rahul! Glad to have you connect. Let's set up a time to review the probability problems."
    })
    assert msg2.status_code == 201, f"Message 2 failed: {msg2.text}"
    print("Step 16 PASS: Real conversation started and messages exchanged.")

    # Step 17 & 18: Messages persist and retrieve after refresh
    chat_view = student_client.get(f"/api/network/conversations/{conn_id}/messages").json()
    assert len(chat_view["messages"]) >= 2, f"Expected at least 2 messages, got: {chat_view['messages']}"
    assert chat_view["messages"][-1]["body"] == "Welcome Rahul! Glad to have you connect. Let's set up a time to review the probability problems."
    print("Steps 17 & 18 PASS: Messages persist in DB and retrieved accurately.")

    # Step 19, 20, 21, 22: Logout and Login again, verify data remains
    student_client.post("/api/auth/logout")
    relogin_client = create_authed_client()
    relogin_resp = relogin_client.post("/api/auth/login", json={
        "email": "rahul.student@rubriq.edu",
        "password": "Student@123456"
    })
    assert relogin_resp.status_code == 200, "Re-login failed!"
    
    # Check connections and chat after fresh login
    relogin_conns = relogin_client.get("/api/network/connections").json()["items"]
    active_c = next((c for c in relogin_conns if c["id"] == conn_id), None)
    assert active_c is not None, "Connection record disappeared after re-login!"
    assert active_c["status"] == "accepted"

    relogin_chat = relogin_client.get(f"/api/network/conversations/{conn_id}/messages").json()
    assert len(relogin_chat["messages"]) >= 2
    print("Steps 19, 20, 21, 22 PASS: Complete lifecycle persisted across logout and fresh re-login!")

    print("=================================================================")
    print("ALL 22 STEPS PASSED WITH 100% REAL PERSISTENCE!")
    print("=================================================================")

if __name__ == "__main__":
    run_test()
