import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { COURSE_OPTIONS } from '../constants';

const BatchForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        course: '',
        batch_name: '',
        start_date: '',
        trainer: '',
        classroom_name: '',
        start_time: '',
        end_time: '',
        days_of_week: '',
        zoom_host_account: '',
        zoom_host_password: '',
        zoom_meeting_id: '',
        zoom_meeting_passcode: '',
        zoom_link: '',
    });

    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTrainers();
        if (isEditMode) {
            fetchBatch();
        }
    }, [id]);

    const fetchTrainers = async () => {
        try {
            const response = await api.get('/users/?role=TRAINER');
            setTrainers(response.data);
        } catch (err) {
            console.error("Failed to fetch trainers", err);
        }
    };

    const fetchBatch = async () => {
        try {
            const response = await api.get(`/batches/${id}/`);
            setFormData({
                course: response.data.course || '',
                batch_name: response.data.batch_name,
                start_date: response.data.start_date,
                trainer: response.data.trainer || '',
                classroom_name: response.data.classroom_name || '',
                start_time: response.data.start_time || '',
                end_time: response.data.end_time || '',
                days_of_week: response.data.days_of_week || '',
                zoom_host_account: response.data.zoom_host_account || '',
                zoom_host_password: response.data.zoom_host_password || '',
                zoom_meeting_id: response.data.zoom_meeting_id || '',
                zoom_meeting_passcode: response.data.zoom_meeting_passcode || '',
                zoom_link: response.data.zoom_link || '',
            });
        } catch (err) {
            console.error("Failed to fetch batch", err);
            setError('Failed to load batch data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Create a copy of formData and convert empty strings to null
        const payload = { ...formData };
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') {
                payload[key] = null;
            }
        });

        try {
            if (isEditMode) {
                await api.put(`/batches/${id}/`, payload);
            } else {
                await api.post('/batches/', payload);
            }
            navigate('/batches');
        } catch (err) {
            console.error(err);
            setError('Failed to save batch. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Basic Info</h2>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Batch Name</label>
                    <input
                        type="text"
                        name="batch_name"
                        value={formData.batch_name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Course</label>
                    <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="">-- Select Course --</option>
                        {Object.entries(COURSE_OPTIONS).map(([category, courses]) => (
                            <optgroup key={category} label={category}>
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Assign Trainer</label>
                    <select
                        name="trainer"
                        value={formData.trainer}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">-- Select Trainer --</option>
                        {trainers.map(trainer => (
                            <option key={trainer.id} value={trainer.id}>{trainer.username}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Schedule & Location</h2>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Classroom Name</label>
                    <select
                        name="classroom_name"
                        value={formData.classroom_name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">-- Select Classroom --</option>
                        <option value="Orange Classroom">Orange Classroom</option>
                        <option value="Blue Classroom">Blue Classroom</option>
                        <option value="Green Classroom">Green Classroom</option>
                        <option value="Meeting Room">Meeting Room</option>
                        <option value="Passage">Passage</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Days of Week</label>
                    <input
                        type="text"
                        name="days_of_week"
                        value={formData.days_of_week}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="e.g. Mon,Tue,Wed"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Start Time</label>
                    <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">End Time</label>
                    <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Zoom Details</h2>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Zoom Host Account</label>
                    <input
                        type="text"
                        name="zoom_host_account"
                        value={formData.zoom_host_account}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Zoom Host Password</label>
                    <input
                        type="text"
                        name="zoom_host_password"
                        value={formData.zoom_host_password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Meeting ID</label>
                    <input
                        type="text"
                        name="zoom_meeting_id"
                        value={formData.zoom_meeting_id}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Meeting Passcode</label>
                    <input
                        type="text"
                        name="zoom_meeting_passcode"
                        value={formData.zoom_meeting_passcode}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="md:col-span-2 mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Zoom Link</label>
                    <input
                        type="url"
                        name="zoom_link"
                        value={formData.zoom_link}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="https://zoom.us/j/..."
                    />
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-bold"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isEditMode ? 'Update Batch' : 'Create Batch')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BatchForm;
