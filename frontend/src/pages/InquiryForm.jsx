import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { DEGREE_OPTIONS, BRANCH_OPTIONS, COURSE_OPTIONS } from '../constants';

const InquiryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        college: '',
        degree: '',
        branch: '',
        passout_year: '',
        interested_course: '',
        source: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchInquiry();
        }
    }, [id]);

    const fetchInquiry = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/inquiries/${id}/`);
            setFormData(response.data);
        } catch (err) {
            setError('Failed to fetch inquiry details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mobile Validation
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile)) {
            setError('Mobile number must be exactly 10 digits.');
            return;
        }

        try {
            if (isEditMode) {
                await api.put(`/inquiries/${id}/`, formData);
            } else {
                await api.post('/inquiries/', formData);
            }
            navigate('/inquiries');
        } catch (err) {
            let errorMessage = isEditMode ? 'Failed to update inquiry.' : 'Failed to create inquiry.';
            if (err.response && err.response.data) {
                // Check if it's a detail error or field errors
                if (err.response.data.detail) {
                    errorMessage += ' ' + err.response.data.detail;
                } else {
                    // It's likely field validation errors
                    errorMessage += ' ' + JSON.stringify(err.response.data);
                }
            }
            setError(errorMessage);
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{isEditMode ? 'Edit Inquiry' : 'Add New Inquiry'}</h1>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Full Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Mobile</label>
                        <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">College</label>
                        <input name="college" value={formData.college} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>

                    <div>
                        <label className="block text-gray-700">Degree</label>
                        <select name="degree" value={formData.degree} onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Select Degree</option>
                            {Object.entries(DEGREE_OPTIONS).map(([group, options]) => (
                                <optgroup key={group} label={group}>
                                    {options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700">Branch</label>
                        <select name="branch" value={formData.branch} onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Select Branch</option>
                            {Object.entries(BRANCH_OPTIONS).map(([group, options]) => (
                                <optgroup key={group} label={group}>
                                    {options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700">Passout Year</label>
                        <input name="passout_year" type="number" value={formData.passout_year} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Interested Course</label>
                        <select name="interested_course" value={formData.interested_course} onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Select Course</option>
                            {Object.entries(COURSE_OPTIONS).map(([group, options]) => (
                                <optgroup key={group} label={group}>
                                    {options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">Source</label>
                        <input name="source" value={formData.source} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button type="button" onClick={() => navigate('/inquiries')} className="px-4 py-2 border rounded hover:bg-gray-100 text-sm md:text-base">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm md:text-base">{isEditMode ? 'Update Inquiry' : 'Save Inquiry'}</button>
                </div>
            </form>
        </div>
    );
};

export default InquiryForm;
