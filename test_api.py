import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def print_response(response, label):
    print(f"\n--- {label} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def run_tests():
    # 1. Login as Admin
    print("Logging in as Admin...")
    auth_response = requests.post(f"{BASE_URL}/auth/token/", data={
        "username": "admin",
        "password": "adminpass"
    })
    print_response(auth_response, "Login")
    
    if auth_response.status_code != 200:
        print("Login failed, aborting.")
        return

    token = auth_response.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Inquiry
    print("\nCreating Inquiry...")
    inquiry_data = {
        "name": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com",
        "college": "ABC College",
        "degree": "B.Tech",
        "branch": "CS",
        "passout_year": 2024,
        "interested_course": "Python Full Stack",
        "source": "LinkedIn"
    }
    inquiry_response = requests.post(f"{BASE_URL}/inquiries/", json=inquiry_data, headers=headers)
    print_response(inquiry_response, "Create Inquiry")
    
    if inquiry_response.status_code != 201:
        print("Inquiry creation failed.")
        return
    
    inquiry_id = inquiry_response.json()["id"]

    # 3. Create Batch
    print("\nCreating Batch...")
    batch_data = {
        "course": "Python Full Stack",
        "batch_name": "Py-2024-01",
        "start_date": "2024-01-01"
    }
    batch_response = requests.post(f"{BASE_URL}/batches/", json=batch_data, headers=headers)
    print_response(batch_response, "Create Batch")
    batch_id = batch_response.json()["id"]

    # 4. Create Student (Admission)
    print("\nCreating Student (Admission)...")
    student_data = {
        "inquiry": inquiry_id,
        "registration_no": "REG-001",
        "mobile": "9876543210",
        "email": "john@example.com",
        "course": "Python Full Stack",
        "batch": batch_id,
        "status": "ACTIVE"
    }
    student_response = requests.post(f"{BASE_URL}/students/", json=student_data, headers=headers)
    print_response(student_response, "Create Student")
    student_id = student_response.json()["id"]

    # 5. Collect Fee
    print("\nCollecting Fee...")
    fee_data = {
        "student": student_id,
        "amount": 5000.00,
        "mode": "ONLINE",
        "utr": "UTR123456"
    }
    fee_response = requests.post(f"{BASE_URL}/fees/", json=fee_data, headers=headers)
    print_response(fee_response, "Collect Fee")

    # 6. Mark Attendance
    print("\nMarking Attendance...")
    attendance_data = {
        "batch": batch_id,
        "student": student_id,
        "date": "2024-01-02",
        "status": "PRESENT",
        "topic_taught": "Intro to Python"
    }
    attendance_response = requests.post(f"{BASE_URL}/attendance/", json=attendance_data, headers=headers)
    print_response(attendance_response, "Mark Attendance")

    # 7. Placement Outreach
    print("\nLogging Outreach...")
    outreach_data = {
        "company_name": "Tech Corp",
        "contact_name": "Jane Smith",
        "mode": "EMAIL",
        "phone_email": "jane@techcorp.com",
        "remark": "Interested in hiring"
    }
    outreach_response = requests.post(f"{BASE_URL}/outreach/", json=outreach_data, headers=headers)
    print_response(outreach_response, "Log Outreach")

    # 8. Dashboard Stats
    print("\nFetching Dashboard Stats...")
    dashboard_response = requests.get(f"{BASE_URL}/dashboard/stats/", headers=headers)
    print_response(dashboard_response, "Dashboard Stats")

if __name__ == "__main__":
    run_tests()
