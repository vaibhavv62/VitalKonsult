from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Inquiry, Batch, Student, Fee, Attendance, PlacementOutreach


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('username',)
    
    # Add role field to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role', 'phone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role', 'phone')}),
    )


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'mobile', 'interested_course', 'college', 'created_at')
    list_filter = ('interested_course', 'source', 'created_at')
    search_fields = ('name', 'mobile', 'email')


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batch_name', 'course', 'trainer', 'start_date')
    list_filter = ('course', 'trainer')
    search_fields = ('batch_name',)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'mobile', 'course', 'batch', 'status')
    list_filter = ('status', 'course', 'batch')
    search_fields = ('mobile', 'inquiry__name')
    
    def get_name(self, obj):
        return obj.inquiry.name
    get_name.short_description = 'Name'


@admin.register(Fee)
class FeeAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'amount', 'mode', 'date_collected')
    list_filter = ('mode', 'date_collected')
    search_fields = ('student__inquiry__name', 'student__mobile')
    
    def get_student_name(self, obj):
        return obj.student.inquiry.name
    get_student_name.short_description = 'Student'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'batch', 'date', 'status')
    list_filter = ('status', 'batch', 'date')
    
    def get_student_name(self, obj):
        return obj.student.inquiry.name
    get_student_name.short_description = 'Student'


@admin.register(PlacementOutreach)
class PlacementOutreachAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_name', 'mode', 'officer', 'date')
    list_filter = ('mode', 'date')
    search_fields = ('company_name', 'contact_name')
