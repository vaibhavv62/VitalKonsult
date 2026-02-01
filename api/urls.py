from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    InquiryViewSet, BatchViewSet, StudentViewSet, FeeViewSet,
    AttendanceViewSet, PlacementOutreachViewSet, DashboardViewSet, UserViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'fees', FeeViewSet, basename='fee')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'outreach', PlacementOutreachViewSet, basename='outreach')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
