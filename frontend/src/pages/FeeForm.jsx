import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const FeeForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        student: '', // Student ID
        amount: '',
        mode: 'UPI',
        utr: '', // For online payments / Cheque No
    });

    const [searchMobile, setSearchMobile] = useState('');
    const [foundStudent, setFoundStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Changed from string to object
    const [searchError, setSearchError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchError('');
        setFoundStudent(null);
        setFormData(prev => ({ ...prev, student: '' }));

        if (!searchMobile) {
            setSearchError('Please enter a mobile number');
            return;
        }

        setSearchLoading(true);
        try {
            const response = await api.get(`/students/?mobile=${searchMobile}`);
            if (response.data && response.data.length > 0) {
                const student = response.data[0];
                setFoundStudent(student);
                setFormData(prev => ({ ...prev, student: student.id }));
            } else {
                setSearchError('No student found with this mobile number.');
            }
        } catch (err) {
            console.error("Search failed", err);
            setSearchError('Failed to search student. Please try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePaymentDetails = () => {
        const { mode, utr, amount } = formData;
        const newErrors = {};

        if (!amount || Number(amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount.';
        }

        if (mode !== 'CASH') {
            if (!utr) {
                newErrors.utr = `Please enter ${mode === 'CHEQUE' ? 'Cheque Number' : 'UTR/Transaction ID'}`;
            } else {
                const alphanumericRegex = /^[a-zA-Z0-9]+$/;
                const numericRegex = /^[0-9]+$/;

                if (mode === 'UPI') {
                    if (utr.length !== 12 || !alphanumericRegex.test(utr)) {
                        newErrors.utr = 'UPI Transaction ID must be exactly 12 alphanumeric characters.';
                    }
                } else if (mode === 'NEFT') {
                    if (utr.length !== 16 || !alphanumericRegex.test(utr)) {
                        newErrors.utr = 'NEFT Transaction ID must be exactly 16 alphanumeric characters.';
                    }
                } else if (mode === 'RTGS') {
                    if (utr.length !== 22 || !alphanumericRegex.test(utr)) {
                        newErrors.utr = 'RTGS Transaction ID must be exactly 22 alphanumeric characters.';
                    }
                } else if (mode === 'CHEQUE') {
                    if (utr.length !== 6 || !numericRegex.test(utr)) {
                        newErrors.utr = 'Cheque Number must be exactly 6 digits.';
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.student) {
            setErrors({ general: "Please search and select a student first." });
            return;
        }

        if (!validatePaymentDetails()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.post('/fees/', formData);
            navigate('/fees');
        } catch (err) {
            console.error(err);
            // Handle API errors (DRF returns field-specific errors)
            if (err.response?.data) {
                setErrors(err.response.data);
            } else {
                setErrors({ general: 'An error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Collect Fee</h1>

            {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {errors.general}
                </div>
            )}

            <div className="bg-white p-4 md:p-6 rounded shadow-md mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700">Find Student</h2>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <input
                        type="text"
                        placeholder="Enter Student Mobile Number"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value)}
                        className="flex-1 border p-2 rounded"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searchLoading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {searchError && <p className="text-red-500 mt-2">{searchError}</p>}

                {foundStudent && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                        <h3 className="font-bold text-green-800">Student Found!</h3>
                        <p><strong>Name:</strong> {foundStudent.inquiry_details?.name}</p>
                        <p><strong>Course:</strong> {foundStudent.course}</p>
                        <p><strong>Batch:</strong> {foundStudent.batch_name || 'Not Assigned'}</p>
                    </div>
                )}
            </div>

            {foundStudent && (
                <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded shadow-md">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700">Payment Details</h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className={`w-full border p-2 rounded ${errors.amount ? 'border-red-500' : ''}`}
                            required
                            min="0"
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Payment Mode</label>
                        <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="UPI">UPI</option>
                            <option value="NEFT">NEFT</option>
                            <option value="RTGS">RTGS</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="CASH">Cash</option>
                        </select>
                    </div>

                    {formData.mode !== 'CASH' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">
                                {formData.mode === 'CHEQUE' ? 'Cheque Number' : 'UTR / Transaction ID'}
                            </label>
                            <input
                                type="text"
                                name="utr"
                                value={formData.utr}
                                onChange={handleChange}
                                className={`w-full border p-2 rounded ${errors.utr ? 'border-red-500' : ''}`}
                                placeholder={
                                    formData.mode === 'UPI' ? '12 alphanumeric characters' :
                                        formData.mode === 'NEFT' ? '16 alphanumeric characters' :
                                            formData.mode === 'RTGS' ? '22 alphanumeric characters' :
                                                '6 digits'
                                }
                            />
                            {errors.utr && <p className="text-red-500 text-sm mt-1">{errors.utr}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition font-bold"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Collect Fee'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeeForm;
