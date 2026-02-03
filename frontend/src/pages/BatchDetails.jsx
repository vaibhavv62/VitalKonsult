import { useState, useEffect } from 'react';
import api from '../api';
import { useParams, Link } from 'react-router-dom';

const BatchDetails = () => {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const batchRes = await api.get(`/batches/${id}/`);
            setBatch(batchRes.data);

            const studentRes = await api.get(`/students/?batch=${id}`);
            setStudents(studentRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch batch details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!batch) return <div className="p-8">Batch not found.</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{batch.batch_name}</h1>
                    <p className="text-gray-500 mt-1">Trainer: {batch.trainer_name || 'Unassigned'}</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/batches" className="px-4 py-2 border rounded hover:bg-gray-100">
                        Back to List
                    </Link>
                    <Link to={`/batches/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Edit Batch
                    </Link>
                </div>
            </div>

            {/* Batch Stats / Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="text-lg font-bold">{batch.course_name || 'N/A'}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-bold">
                        {batch.start_date} - {batch.end_date || 'Ongoing'}
                    </p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                    <p className="text-sm text-gray-500">Students Enrolled</p>
                    <p className="text-lg font-bold">{students.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Schedule & Location */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Schedule & Location</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Classroom:</span>
                            <span className="font-semibold">{batch.classroom_name || 'Not Set'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Timing:</span>
                            <span className="font-semibold">{batch.start_time} - {batch.end_time || 'End'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Days:</span>
                            <span className="font-semibold">{batch.days_of_week || 'Not Set'}</span>
                        </div>
                    </div>
                </div>

                {/* Zoom Details */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Zoom Details</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="block text-gray-600 text-sm">Zoom Link:</span>
                            {batch.zoom_link ? (
                                <a href={batch.zoom_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                    {batch.zoom_link}
                                </a>
                            ) : (
                                <span className="text-gray-400">Not Available</span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Meeting ID:</span>
                            <span className="font-semibold select-all">{batch.zoom_meeting_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Passcode:</span>
                            <span className="font-semibold select-all">{batch.zoom_meeting_passcode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600 text-sm">Host Account:</span>
                            <span className="text-sm font-medium">{batch.zoom_host_account || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Student List</h2>

                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                            <Link to={`/students/${student.id}`}>{student.inquiry_name || student.name || 'Unknown'}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.mobile}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.course}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    student.status === 'DROPPED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 italic py-4 text-center">No students assigned to this batch yet.</p>
                )}
            </div>
        </div>
    );
};

export default BatchDetails;
