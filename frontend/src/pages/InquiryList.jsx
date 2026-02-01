import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { COURSE_OPTIONS } from '../constants';

const InquiryList = () => {
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [courseFilter, setCourseFilter] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('');
    const [createdByFilter, setCreatedByFilter] = useState('');

    // Date Filters
    const [dateFilter, setDateFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    useEffect(() => {
        filterData();
    }, [inquiries, courseFilter, collegeFilter, createdByFilter, dateFilter, startDate, endDate]);

    const fetchInquiries = async () => {
        try {
            const response = await api.get('/inquiries/');
            setInquiries(response.data);
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let result = inquiries;

        // Date Filtering
        if (dateFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            result = result.filter(item => {
                const itemDate = new Date(item.created_at);
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
                    const itemTime = new Date(item.created_at).getTime();
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
            result = result.filter(item => item.interested_course === courseFilter);
        }
        if (collegeFilter) {
            result = result.filter(item => item.college && item.college.toLowerCase().includes(collegeFilter.toLowerCase()));
        }
        if (createdByFilter) {
            result = result.filter(item => item.created_by_name && item.created_by_name.toLowerCase().includes(createdByFilter.toLowerCase()));
        }

        setFilteredInquiries(result);
    };

    const resetFilters = () => {
        setCourseFilter('');
        setCollegeFilter('');
        setCreatedByFilter('');
        setDateFilter('');
        setStartDate('');
        setEndDate('');
    };

    if (loading) return <div>Loading inquiries...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Inquiries</h1>
                <Link
                    to="/inquiries/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
                >
                    Add New Inquiry
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInquiries.map((inquiry) => (
                            <tr key={inquiry.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(inquiry.created_at).toLocaleDateString()} {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{inquiry.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inquiry.mobile}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inquiry.interested_course}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inquiry.college}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inquiry.created_by_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/inquiries/${inquiry.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {filteredInquiries.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No inquiries found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InquiryList;
