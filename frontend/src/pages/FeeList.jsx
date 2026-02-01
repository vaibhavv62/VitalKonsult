import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const FeeList = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const response = await api.get('/fees/');
            setFees(response.data);
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading fees...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Fees</h1>
                <Link
                    to="/fees/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm md:text-base"
                >
                    Collect New Fee
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fees.map((fee) => (
                            <tr key={fee.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{fee.student_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{fee.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(fee.date_collected).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{fee.payment_mode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.collected_by_name}</td>
                            </tr>
                        ))}
                        {fees.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No fee records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeeList;
