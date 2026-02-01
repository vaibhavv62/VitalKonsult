import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const AttendanceForm = () => {
    const navigate = useNavigate();
    const { batchId } = useParams(); // Optional: pre-select batch if coming from dashboard

    const [selectedBatch, setSelectedBatch] = useState(batchId || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [lectureTime, setLectureTime] = useState('');
    const [topic, setTopic] = useState('');
    const [remarks, setRemarks] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetchStudentsInBatch(selectedBatch);
        }
    }, [selectedBatch]);

    const fetchBatches = async () => {
        try {
            const response = await api.get('/batches/');
            setBatches(response.data);
        } catch (err) {
            console.error("Failed to fetch batches", err);
        }
    };

    const fetchStudentsInBatch = async (batchId) => {
        try {
            // Ideally backend should support filtering students by batch
            // For now, fetching all students and filtering client-side if API doesn't support it yet
            // Or better, update StudentViewSet to filter by batch
            const response = await api.get('/students/');
            const batchStudents = response.data.filter(s => s.batch === parseInt(batchId));
            setStudents(batchStudents);

            // Initialize status as PRESENT_OFFLINE for all
            const initialStatus = {};
            batchStudents.forEach(s => initialStatus[s.id] = 'PRESENT_OFFLINE');
            setAttendanceStatus(initialStatus);

        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Send multiple requests or a bulk create endpoint
            // Since our API is simple CRUD, we'll loop. In production, use bulk create.
            const promises = students.map(student => {
                return api.post('/attendance/', {
                    student: student.id,
                    batch: selectedBatch,
                    date: date,
                    lecture_time: lectureTime,
                    topic_taught: topic,
                    remarks: remarks,
                    status: attendanceStatus[student.id]
                });
            });

            await Promise.all(promises);
            navigate('/attendance');
        } catch (err) {
            console.error(err);
            setError('Failed to save attendance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Mark Attendance</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Select Batch</label>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">-- Select Batch --</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Lecture Time</label>
                        <input
                            type="time"
                            value={lectureTime}
                            onChange={(e) => setLectureTime(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Topic Covered</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="e.g. React Hooks"
                            required
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Remarks (Optional)</label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full border p-2 rounded"
                        rows="2"
                        placeholder="Any additional notes..."
                    />
                </div>

                {selectedBatch && students.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-base md:text-lg font-semibold mb-3">Students</h3>
                        <div className="space-y-2">
                            {students.map(student => (
                                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border gap-2">
                                    <span className="text-sm md:text-base">{student.inquiry_details?.name} ({student.mobile})</span>
                                    <div className="flex gap-3 md:gap-4 text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                value="PRESENT_OFFLINE"
                                                checked={attendanceStatus[student.id] === 'PRESENT_OFFLINE'}
                                                onChange={() => handleStatusChange(student.id, 'PRESENT_OFFLINE')}
                                                className="text-green-600"
                                            />
                                            Offline
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                value="PRESENT_ONLINE"
                                                checked={attendanceStatus[student.id] === 'PRESENT_ONLINE'}
                                                onChange={() => handleStatusChange(student.id, 'PRESENT_ONLINE')}
                                                className="text-blue-600"
                                            />
                                            Online
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                value="ABSENT"
                                                checked={attendanceStatus[student.id] === 'ABSENT'}
                                                onChange={() => handleStatusChange(student.id, 'ABSENT')}
                                                className="text-red-600"
                                            />
                                            Absent
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedBatch && students.length === 0 && (
                    <p className="text-gray-500 mb-6">No students found in this batch.</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-bold"
                    disabled={loading || !selectedBatch || students.length === 0}
                >
                    {loading ? 'Saving...' : 'Save Attendance'}
                </button>
            </form>
        </div>
    );
};

export default AttendanceForm;
