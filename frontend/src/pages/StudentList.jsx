import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { COURSE_OPTIONS } from '../constants';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [courseFilter, setCourseFilter] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('');
    const [createdByFilter, setCreatedByFilter] = useState('');

    // Date Filters
    const [dateFilter, setDateFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterData();
    }, [students, searchTerm, courseFilter, collegeFilter, createdByFilter, dateFilter, startDate, endDate]);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students/');
            setStudents(response.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let result = students;

        // Search Term Filtering
        if (searchTerm) {
            result = result.filter(student =>
                student.inquiry_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.mobile?.includes(searchTerm)
            );
        }

        // Date Filtering (Enrollment Date)
        if (dateFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            result = result.filter(item => {
                const itemDate = new Date(item.enrollment_date);
                itemDate.setHours(0, 0, 0, 0);

                if (dateFilter === 'today') {
                    return itemDate.getTime() === today.getTime();
                } else if (dateFilter === 'yesterday') {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return itemDate.getTime() === yesterday.getTime();
                } else if (dateFilter === 'last_week') {
                    const lastWeek = new Date(today);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    return itemDate >= lastWeek;
                } else if (dateFilter === 'custom') {
                    const itemTime = new Date(item.enrollment_date).getTime();
                    let isValid = true;

                    if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        isValid = isValid && itemTime >= start.getTime();
                    }

                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        isValid = isValid && itemTime <= end.getTime();
                    }

                    return isValid;
                }
                return true;
            });
        }

        if (courseFilter) {
            result = result.filter(item => item.course === courseFilter);
        }
        if (collegeFilter) {
            result = result.filter(item => item.inquiry_details?.college && item.inquiry_details.college.toLowerCase().includes(collegeFilter.toLowerCase()));
        }
        if (createdByFilter) {
            // Note: Student model doesn't strictly have created_by, but Inquiry does. 
            // Assuming we might want to filter by who admitted them or who created the inquiry.
            // For now, let's filter by Inquiry's created_by_name if available in inquiry_details
            // Or if we added created_by to Student, we'd use that.
            // Let's check serializer. StudentSerializer has inquiry_details.
            // InquirySerializer has created_by_name.
            result = result.filter(item => item.inquiry_details?.created_by_name && item.inquiry_details.created_by_name.toLowerCase().includes(createdByFilter.toLowerCase()));
        }

        setFilteredStudents(result);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCourseFilter('');
        setCollegeFilter('');
        setCreatedByFilter('');
        setDateFilter('');
        setStartDate('');
        setEndDate('');
    };

    if (loading) return <div>Loading students...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Students</h1>
                <Link
                    to="/students/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
                >
                    Admit New Student
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
                    <button
                        onClick={resetFilters}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Reset All Filters
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Search</label>
                        <input
                            type="text"
                            placeholder="Name or Mobile"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Date</label>
                        <select
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_week">Last Week</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        {dateFilter === 'custom' && (
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">From:</span>
                                    <input type="date" className="border p-1 rounded w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">To:</span>
                                    <input type="date" className="border p-1 rounded w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Course</label>
                        <select
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {Object.entries(COURSE_OPTIONS).map(([group, options]) => (
                                <optgroup key={group} label={group}>
                                    {options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by College</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Search College"
                            value={collegeFilter}
                            onChange={(e) => setCollegeFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Created By</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Search Counselor"
                            value={createdByFilter}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{student.inquiry_details?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.mobile}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.batch_name || 'Unassigned'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(student.enrollment_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/students/${student.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;
