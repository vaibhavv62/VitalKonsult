import { useEffect, useState } from 'react';
import api from '../api';

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manager Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Total Inquiries</h3>
                    <p className="text-3xl font-bold">{stats?.total_inquiries || 0}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Total Students</h3>
                    <p className="text-3xl font-bold">{stats?.total_students || 0}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Fees Collected</h3>
                    <p className="text-3xl font-bold">₹{stats?.total_fees || 0}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Placements Logged</h3>
                    <p className="text-3xl font-bold">{stats?.placements || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
