import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_fees_collected: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">HR Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Total Students</h2>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{stats.total_students}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Fees Collected</h2>
                    <p className="text-4xl font-bold text-green-600 mt-2">₹{stats.total_fees_collected}</p>
                </div>
                {/* Placeholder for Batches or other stats */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Quick Actions</h2>
                    <div className="flex flex-col gap-2 mt-2">
                        <Link to="/students/new" className="text-blue-500 hover:underline">Admit New Student</Link>
                        <Link to="/fees/new" className="text-blue-500 hover:underline">Collect Fees</Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Admissions</h2>
                    <p className="text-gray-500">List of recent students will go here...</p>
                    <Link to="/students" className="text-blue-500 hover:underline mt-4 block">View All Students</Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Fee Collections</h2>
                    <p className="text-gray-500">List of recent transactions will go here...</p>
                    <Link to="/fees" className="text-blue-500 hover:underline mt-4 block">View All Fees</Link>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
