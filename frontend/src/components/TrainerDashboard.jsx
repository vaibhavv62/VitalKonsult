import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const TrainerDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [todaysBatches, setTodaysBatches] = useState([]);
    const [expandedBatchId, setExpandedBatchId] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await api.get('/batches/');
            setBatches(response.data);
            filterTodaysBatches(response.data);
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setLoading(false);
        }
    };

    const filterTodaysBatches = (allBatches) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = days[new Date().getDay()];

        const filtered = allBatches.filter(batch =>
            batch.days_of_week && batch.days_of_week.includes(today)
        );
        setTodaysBatches(filtered);
    };

    const toggleExpand = (batchId) => {
        setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Trainer Dashboard</h1>

            {/* Today's Schedule Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Today's Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todaysBatches.map(batch => (
                        <div
                            key={batch.id}
                            className={`bg-blue-50 rounded-lg shadow border border-blue-200 overflow-hidden transition-all duration-300 ${expandedBatchId === batch.id ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
                                }`}
                        >
                            <div
                                className="p-6 cursor-pointer hover:bg-blue-100 transition-colors flex justify-between items-center"
                                onClick={() => toggleExpand(batch.id)}
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-blue-800">{batch.batch_name}</h3>
                                    <p className="text-md font-semibold text-gray-700">{batch.start_time} - {batch.end_time}</p>
                                    <p className="text-sm text-gray-600 mt-1"><strong>Classroom:</strong> {batch.classroom_name || 'N/A'}</p>
                                </div>
                                <div className="text-blue-500 text-xl ml-4">
                                    {expandedBatchId === batch.id ? '▲' : '▼'}
                                </div>
                            </div>

                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedBatchId === batch.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 border-t border-blue-200 bg-white">
                                    <div className="mt-4 flex justify-between items-start">
                                        <div className="flex-1">
                                            {batch.zoom_link ? (
                                                <div>
                                                    <h4 className="font-bold text-gray-700 mb-2">Zoom Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded border">
                                                        <p><strong>Link:</strong> <a href={batch.zoom_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Join Meeting</a></p>
                                                        <p><strong>Meeting ID:</strong> {batch.zoom_meeting_id}</p>
                                                        <p><strong>Passcode:</strong> {batch.zoom_meeting_passcode}</p>
                                                        <p><strong>Host:</strong> {batch.zoom_host_account}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">No Zoom details available.</p>
                                            )}
                                        </div>
                                        <div className="ml-6">
                                            <Link
                                                to={`/attendance/mark/${batch.id}`}
                                                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 inline-block"
                                            >
                                                Mark Attendance
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {todaysBatches.length === 0 && (
                        <p className="text-gray-500 italic">No classes scheduled for today.</p>
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">All Batches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map(batch => (
                        <div key={batch.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <h3 className="text-lg font-bold mb-2">{batch.batch_name}</h3>
                            <p className="text-gray-600 mb-1">Start Date: {batch.start_date}</p>
                            <p className="text-gray-600 mb-4">End Date: {batch.end_date || 'Ongoing'}</p>
                            <Link
                                to={`/attendance/mark/${batch.id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
                            >
                                Mark Attendance
                            </Link>
                        </div>
                    ))}
                    {batches.length === 0 && (
                        <p className="text-gray-500">No batches assigned yet.</p>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Link to="/attendance" className="text-blue-500 hover:underline block mb-2">View Attendance History</Link>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
