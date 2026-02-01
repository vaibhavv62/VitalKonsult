import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const BatchList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await api.get('/batches/');
            setBatches(response.data);
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading batches...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Batches</h1>
                <Link
                    to="/batches/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
                >
                    Create New Batch
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {batches.map((batch) => (
                            <tr key={batch.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{batch.batch_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{batch.start_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{batch.end_date || 'Ongoing'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{batch.trainer_name || 'Unassigned'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/batches/${batch.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {batches.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No batches found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BatchList;
