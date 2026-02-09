from rest_framework import serializers
from .models import User, Inquiry, InquiryFollowup, Batch, Student, Fee, Attendance, PlacementOutreach

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class InquiryFollowupSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = InquiryFollowup
        fields = '__all__'
        read_only_fields = ['created_by']

class InquirySerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    is_admitted = serializers.SerializerMethodField()
    followups = InquiryFollowupSerializer(many=True, read_only=True)

    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_is_admitted(self, obj):
        return hasattr(obj, 'student_profile')

class BatchSerializer(serializers.ModelSerializer):
    trainer_name = serializers.ReadOnlyField(source='trainer.username')
    course_name = serializers.ReadOnlyField(source='course')

    class Meta:
        model = Batch
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    collected_by_name = serializers.ReadOnlyField(source='collected_by.username')
    student_name = serializers.ReadOnlyField(source='student.inquiry.name')

    class Meta:
        model = Fee
        fields = '__all__'
        read_only_fields = ['collected_by', 'date_collected']

class StudentSerializer(serializers.ModelSerializer):
    inquiry_details = InquirySerializer(source='inquiry', read_only=True)
    inquiry_name = serializers.ReadOnlyField(source='inquiry.name')
    batch_name = serializers.ReadOnlyField(source='batch.batch_name')
    fees = FeeSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.inquiry.name')
    trainer_name = serializers.ReadOnlyField(source='trainer.username')
    batch_name = serializers.ReadOnlyField(source='batch.batch_name')

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['trainer']

class PlacementOutreachSerializer(serializers.ModelSerializer):
    officer_name = serializers.ReadOnlyField(source='officer.username')

    class Meta:
        model = PlacementOutreach
        fields = '__all__'
        read_only_fields = ['officer', 'date']
