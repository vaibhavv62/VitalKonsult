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
        source: '',
        created_by: '',
        lead_status: 'WARM',
        remark: '',
        fees_told: '',
        next_followup_date: ''
    });
    const [counselors, setCounselors] = useState([]); // State for counselor list
    const [newFollowup, setNewFollowup] = useState({ remark: '', status: '', date: new Date().toISOString().split('T')[0] });
    const [followups, setFollowups] = useState([]); // Timeline history
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
            if (response.data.followups) {
                setFollowups(response.data.followups);
            }
        } catch (err) {
            setError('Failed to fetch inquiry details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounselors();
    }, []);

    const fetchCounselors = async () => {
        try {
            const response = await api.get('/users/?role=COUNSELOR');
            setCounselors(response.data);
        } catch (err) {
            console.error("Failed to fetch counselors", err);
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

    const handleAddFollowup = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/inquiries/${id}/add_followup/`, {
                remark: newFollowup.remark,
                status: newFollowup.status || formData.lead_status, // Use current status if not explicitly changed in followup note
                date: newFollowup.date
            });
            setFollowups([response.data, ...followups]);
            setNewFollowup({ remark: '', status: '', date: new Date().toISOString().split('T')[0] });
            // Optionally update main status if changed
            if (newFollowup.status && newFollowup.status !== formData.lead_status) {
                setFormData({ ...formData, lead_status: newFollowup.status });
            }
        } catch (err) {
            console.error("Failed to add follow-up", err);
            setError("Failed to add follow-up note.");
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

                    {/* Lead Status */}
                    <div>
                        <label className="block text-gray-700">Lead Status</label>
                        <select
                            name="lead_status"
                            value={formData.lead_status || 'WARM'}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="HOT">Hot</option>
                            <option value="WARM">Warm</option>
                            <option value="COLD">Cold</option>
                            <option value="ENROLLED">Enrolled</option>
                        </select>
                    </div>

                    {/* Fees Told */}
                    <div>
                        <label className="block text-gray-700">Fees Quoted (₹)</label>
                        <input
                            name="fees_told"
                            type="number"
                            step="0.01"
                            value={formData.fees_told || ''}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="e.g. 50000"
                        />
                    </div>

                    {/* Next Follow-up Date */}
                    <div>
                        <label className="block text-gray-700">Next Follow-up Date</label>
                        <input
                            name="next_followup_date"
                            type="date"
                            value={formData.next_followup_date || ''}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Assigned Counselor Dropdown */}
                    <div>
                        <label className="block text-gray-700">Assigned Counselor</label>
                        <select
                            name="created_by"
                            value={formData.created_by || ''}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value=""> -- Assign to Yourself (Default) -- </option>
                            {counselors.map(counselor => (
                                <option key={counselor.id} value={counselor.id}>
                                    {counselor.username}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Leave blank to assign to yourself.</p>
                    </div>

                    {/* Remarks (Full width) */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700">Remark / Notes</label>
                        <textarea
                            name="remark"
                            value={formData.remark || ''}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            rows="3"
                            placeholder="Detailed notes about the conversation..."
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button type="button" onClick={() => navigate('/inquiries')} className="px-4 py-2 border rounded hover:bg-gray-100 text-sm md:text-base">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm md:text-base">{isEditMode ? 'Update Inquiry' : 'Save Inquiry'}</button>
                </div>
            </form>

            {/* Timeline / History Section (Only in Edit Mode) */}
            {isEditMode && (
                <div className="mt-8 bg-white p-4 md:p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Lead History & Timeline</h2>

                    {/* Add New Follow-up Form */}
                    <div className="bg-gray-50 p-4 rounded mb-6 border">
                        <h3 className="text-sm font-semibold mb-2">Log New Interaction (Call/Visit)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="date"
                                value={newFollowup.date}
                                onChange={(e) => setNewFollowup({ ...newFollowup, date: e.target.value })}
                                className="border p-2 rounded text-sm"
                            />
                            <select
                                value={newFollowup.status}
                                onChange={(e) => setNewFollowup({ ...newFollowup, status: e.target.value })}
                                className="border p-2 rounded text-sm"
                            >
                                <option value="">Keep Current Status ({formData.lead_status})</option>
                                <option value="HOT">Change to HOT</option>
                                <option value="WARM">Change to WARM</option>
                                <option value="COLD">Change to COLD</option>
                                <option value="ENROLLED">Change to ENROLLED</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Short Note / Remark..."
                                value={newFollowup.remark}
                                onChange={(e) => setNewFollowup({ ...newFollowup, remark: e.target.value })}
                                className="border p-2 rounded text-sm"
                            />
                        </div>
                        <button
                            onClick={handleAddFollowup}
                            disabled={!newFollowup.remark}
                            className="mt-3 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Add to Timeline
                        </button>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-4">
                        {followups.length === 0 ? (
                            <p className="text-gray-500 text-sm">No history recorded yet.</p>
                        ) : (
                            followups.map((item) => (
                                <div key={item.id} className="flex gap-4 border-l-2 border-indigo-200 pl-4 pb-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{new Date(item.date).toLocaleDateString()}</p>
                                                <span className="text-xs text-gray-500">by {item.created_by_name}</span>
                                            </div>
                                            {item.status && (
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Status: {item.status}</span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mt-1 text-sm">{item.remark}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InquiryForm;
