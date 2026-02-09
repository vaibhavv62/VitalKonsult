from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from .models import User, Inquiry, InquiryFollowup, Batch, Student, Fee, Attendance, PlacementOutreach
from .serializers import (
    UserSerializer, InquirySerializer, InquiryFollowupSerializer, BatchSerializer, StudentSerializer,
    FeeSerializer, AttendanceSerializer, PlacementOutreachSerializer
)

# Custom Permissions
class IsCounselor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.COUNSELOR or request.user.is_superuser

class IsHRAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.HR_ADMIN or request.user.is_superuser

class IsTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.TRAINER or request.user.is_superuser

class IsPlacementOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.PLACEMENT_OFFICER or request.user.is_superuser

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.MANAGER or request.user.is_superuser

class InquiryViewSet(viewsets.ModelViewSet):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Inquiry.objects.none()

        if user.role == User.Role.COUNSELOR:
            queryset = Inquiry.objects.filter(created_by=user)
        elif user.role in [User.Role.HR_ADMIN, User.Role.MANAGER]:
            queryset = Inquiry.objects.all()
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(mobile__icontains=search))
        
        return queryset

    def perform_create(self, serializer):
        # Allow created_by to be set from request data if provided (for admin assigning to counselor)
        # The serializer handles validation, we just need to ensure we don't overwrite if it's already there
        # But wait, perform_create is called after validation. 
        # If 'created_by' is in validated_data, it stays. If not, we set it to current user.
        if 'created_by' not in serializer.validated_data:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def add_followup(self, request, pk=None):
        inquiry = self.get_object()
        serializer = InquiryFollowupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(inquiry=inquiry, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.TRAINER:
            return Batch.objects.filter(trainer=user)
        return Batch.objects.all()

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Student.objects.all()
    
    def get_queryset(self):
        queryset = Student.objects.all()
        batch_id = self.request.query_params.get('batch')
        mobile = self.request.query_params.get('mobile')
        
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        if mobile:
            queryset = queryset.filter(mobile=mobile)
            
        return queryset

class FeeViewSet(viewsets.ModelViewSet):
    serializer_class = FeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Fee.objects.all()

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.all()
        
        if user.role == User.Role.TRAINER:
            queryset = queryset.filter(batch__trainer=user)
            
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(trainer=self.request.user)

class PlacementOutreachViewSet(viewsets.ModelViewSet):
    serializer_class = PlacementOutreachSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PlacementOutreach.objects.all()

    def perform_create(self, serializer):
        serializer.save(officer=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.utils import timezone
        import datetime
        
        today = timezone.now().date()
        
        data = {
            'total_inquiries': Inquiry.objects.count(),
            'total_students': Student.objects.count(),
            'total_fees_collected': Fee.objects.aggregate(Sum('amount'))['amount__sum'] or 0,
            'placements': PlacementOutreach.objects.count(),
            
            # Today's Stats
            'fees_today': Fee.objects.filter(date_collected__date=today).aggregate(Sum('amount'))['amount__sum'] or 0,
            'inquiries_today': Inquiry.objects.filter(created_at__date=today).count(),
            'admissions_today': Student.objects.filter(enrollment_date=today).count(),
            'placements_today': PlacementOutreach.objects.filter(date__date=today).count(),
            
            # Recent Activities
            'recent_admissions': StudentSerializer(Student.objects.order_by('-enrollment_date')[:5], many=True).data,
            'recent_fees': FeeSerializer(Fee.objects.order_by('-date_collected')[:5], many=True).data,
        }
        return Response(data)
