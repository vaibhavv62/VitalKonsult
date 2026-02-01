from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        COUNSELOR = 'COUNSELOR', _('Counselor')
        HR_ADMIN = 'HR_ADMIN', _('HR Admin')
        TRAINER = 'TRAINER', _('Trainer')
        PLACEMENT_OFFICER = 'PLACEMENT_OFFICER', _('Placement Officer')
        MANAGER = 'MANAGER', _('Manager')

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.COUNSELOR)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Inquiry(models.Model):
    name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField()
    college = models.CharField(max_length=255)
    degree = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    passout_year = models.IntegerField()
    interested_course = models.CharField(max_length=100)
    source = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='inquiries')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.interested_course}"

class Batch(models.Model):
    course = models.CharField(max_length=100)
    batch_name = models.CharField(max_length=100)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': User.Role.TRAINER}, related_name='batches')
    start_date = models.DateField()
    
    # Schedule & Location
    classroom_name = models.CharField(max_length=100, blank=True, null=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    days_of_week = models.CharField(max_length=50, blank=True, null=True, help_text="Comma-separated days e.g. Mon,Tue,Wed")

    # Zoom Details
    zoom_host_account = models.CharField(max_length=100, blank=True, null=True)
    zoom_host_password = models.CharField(max_length=100, blank=True, null=True)
    zoom_meeting_id = models.CharField(max_length=50, blank=True, null=True)
    zoom_meeting_passcode = models.CharField(max_length=50, blank=True, null=True)
    zoom_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.batch_name

class Student(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('DROPPED', 'Dropped'),
    ]

    COURSE_CHOICES = [
        ('Java', 'Java'),
        ('Python', 'Python'),
        ('Cloud Computing', 'Cloud Computing'),
        ('Data Analytics', 'Data Analytics'),
        ('DSA', 'DSA'),
        ('C Programming', 'C Programming'),
        ('C++', 'C++'),
        ('Data Science', 'Data Science'),
        ('UI/UX', 'UI/UX'),
        ('Cyber Security', 'Cyber Security'),
        ('Agentic AI', 'Agentic AI'),
        ('Data Engineering', 'Data Engineering'),
        ('Software Testing', 'Software Testing'),
    ]

    inquiry = models.OneToOneField(Inquiry, on_delete=models.CASCADE, related_name='student_profile')
    mobile = models.CharField(max_length=15, unique=True) # Redundant but good for quick lookup
    email = models.EmailField()
    course = models.CharField(max_length=100, choices=COURSE_CHOICES)
    total_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    enrollment_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def save(self, *args, **kwargs):
        if not self.mobile and self.inquiry:
            self.mobile = self.inquiry.mobile
        if not self.email and self.inquiry:
            self.email = self.inquiry.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.inquiry.name} ({self.mobile})"

class Fee(models.Model):
    MODE_CHOICES = [
        ('CASH', 'Cash'),
        ('UPI', 'UPI'),
        ('NEFT', 'NEFT'),
        ('RTGS', 'RTGS'),
        ('CHEQUE', 'Cheque'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fees')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    utr = models.CharField(max_length=100, blank=True, null=True)
    date_collected = models.DateTimeField(auto_now_add=True)
    collected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='collected_fees')

    def __str__(self):
        return f"{self.student.inquiry.name} - {self.amount}"

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT_ONLINE', 'Present (Online)'),
        ('PRESENT_OFFLINE', 'Present (Offline)'),
        ('ABSENT', 'Absent'),
    ]

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    lecture_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    topic_taught = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendance')

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.inquiry.name} - {self.date} - {self.status}"

class PlacementOutreach(models.Model):
    MODE_CHOICES = [
        ('CALL', 'Call'),
        ('EMAIL', 'Email'),
        ('LINKEDIN', 'LinkedIn'),
        ('VISIT', 'Visit'),
    ]

    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='outreach_activities')
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    phone_email = models.CharField(max_length=255) # Can be phone or email
    remark = models.TextField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.mode}"
