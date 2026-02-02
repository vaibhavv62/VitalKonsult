from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from .models import User, Inquiry, Batch, Student, Fee, Attendance, PlacementOutreach
from .serializers import (
    UserSerializer, InquirySerializer, BatchSerializer, StudentSerializer,
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
        if 'created_by' not in serializer.validated_data:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

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
        mobile = self.request.query_params.get('mobile')
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

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.PLACEMENT_OFFICER:
            return PlacementOutreach.objects.filter(officer=user)
        return PlacementOutreach.objects.all()

    def perform_create(self, serializer):
        serializer.save(officer=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        data = {}
        user = request.user
        
        if user.role == User.Role.COUNSELOR:
            data['total_inquiries'] = Inquiry.objects.filter(created_by=user).count()
            # Add more counselor stats
            
        elif user.role == User.Role.HR_ADMIN:
            data['total_students'] = Student.objects.count()
            data['total_fees_collected'] = Fee.objects.aggregate(Sum('amount'))['amount__sum'] or 0
            
        elif user.role == User.Role.MANAGER:
            data['total_inquiries'] = Inquiry.objects.count()
            data['total_students'] = Student.objects.count()
            data['total_fees'] = Fee.objects.aggregate(Sum('amount'))['amount__sum'] or 0
            data['placements'] = PlacementOutreach.objects.count()

        return Response(data)
