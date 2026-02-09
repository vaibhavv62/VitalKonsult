import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
    const [stats, setStats] = useState({
        total_inquiries: 0,
        total_students: 0,
        total_fees_collected: 0,
        placements: 0,
        fees_today: 0,
        inquiries_today: 0,
        admissions_today: 0,
        placements_today: 0,
        recent_admissions: [],
        recent_fees: [],
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    // Helper for "visualizations" - ratio of today vs total
    const getRatio = (today, total) => {
        if (!total) return 0;
        return Math.min(100, Math.round((today / total) * 100));
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">HR Admin Dashboard</h1>

            {/* Daily Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Fees Collected Today</p>
                        <p className="text-3xl font-extrabold text-green-600 mt-1">₹{stats.fees_today.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total: ₹{stats.total_fees_collected.toLocaleString()}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${getRatio(stats.fees_today, stats.total_fees_collected)}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Inquiries Today</p>
                        <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.inquiries_today}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total: {stats.total_inquiries}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${getRatio(stats.inquiries_today, stats.total_inquiries)}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Admissions Today</p>
                        <p className="text-3xl font-extrabold text-indigo-600 mt-1">{stats.admissions_today}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total Students: {stats.total_students}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${getRatio(stats.admissions_today, stats.total_students)}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Placements Today</p>
                        <p className="text-3xl font-extrabold text-purple-600 mt-1">{stats.placements_today}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total: {stats.placements}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${getRatio(stats.placements_today, stats.placements)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Visualizations / Charts Placeholder */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-700">Daily Performance Overview</h2>
                    <div className="flex flex-col gap-6">
                        {/* Simple CSS-based bar visualization */}
                        {[
                            { label: 'Inquiries', value: stats.inquiries_today, color: 'bg-blue-500', max: Math.max(stats.inquiries_today, 10) },
                            { label: 'Admissions', value: stats.admissions_today, color: 'bg-indigo-500', max: Math.max(stats.inquiries_today, 10) },
                            { label: 'Placements', value: stats.placements_today, color: 'bg-purple-500', max: Math.max(stats.inquiries_today, 10) }
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                                        style={{ width: `${(item.value / item.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 p-6 bg-blue-50 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-blue-800 font-bold text-lg">Daily Conversions</p>
                            <p className="text-blue-600 text-sm">Target today: 15 inquiries</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-blue-900">{Math.round((stats.inquiries_today / 15) * 100)}%</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-700">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <Link to="/inquiries/new" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                            <span className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">＋</span>
                            <span className="font-semibold text-gray-700">Add New Inquiry</span>
                        </Link>
                        <Link to="/students/new" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100">
                            <span className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">👤</span>
                            <span className="font-semibold text-gray-700">Admit New Student</span>
                        </Link>
                        <Link to="/fees/new" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors border border-transparent hover:border-yellow-100">
                            <span className="flex-shrink-0 w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">₹</span>
                            <span className="font-semibold text-gray-700">Collect Fees</span>
                        </Link>
                        <Link to="/batches/new" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                            <span className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">📅</span>
                            <span className="font-semibold text-gray-700">Create New Batch</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activities Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-700">Recent Admissions</h2>
                        <Link to="/students" className="text-sm text-blue-500 hover:underline">View All</Link>
                    </div>
                    {stats.recent_admissions.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {stats.recent_admissions.map(student => (
                                <div key={student.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{student.inquiry_name}</p>
                                        <p className="text-xs text-gray-500">{student.batch_name || 'Unassigned'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-600">{student.admission_date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic py-4 text-center">No recent admissions.</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-700">Recent Fee Collections</h2>
                        <Link to="/fees" className="text-sm text-blue-500 hover:underline">View All</Link>
                    </div>
                    {stats.recent_fees.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {stats.recent_fees.map(fee => (
                                <div key={fee.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{fee.student_name}</p>
                                        <p className="text-xs text-gray-500">By: {fee.collected_by_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">₹{fee.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">{fee.date_collected}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic py-4 text-center">No recent fee collections.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
