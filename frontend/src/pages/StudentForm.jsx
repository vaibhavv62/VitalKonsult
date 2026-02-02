import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { COURSE_OPTIONS } from '../constants';

const DEGREES = [
    {
        group: "UG Degrees",
        options: ["B.Tech", "B.E", "B.Sc", "B.Sc (Computer Science)", "B.Sc (IT)", "BCA", "B.Com", "BBA", "BA", "B.Voc", "Diploma (Polytechnic)"]
    },
    {
        group: "PG Degrees",
        options: ["M.Tech", "M.E", "M.Sc", "MCA", "MBA", "M.Com", "MA", "PG Diploma"]
    },
    {
        group: "Other",
        options: ["12th Pass", "ITI", "Other (Specify)"]
    }
];

const BRANCHES = [
    {
        group: "Engineering & Technical Branches",
        options: ["Computer Science (CSE)", "Information Technology (IT)", "Electronics & Communication (ECE)", "Electronics & Telecommunication (ENTC)", "Electrical Engineering", "Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Instrumentation Engineering", "Industrial Engineering", "Automobile Engineering", "Chemical Engineering", "Mechatronics"]
    },
    {
        group: "Computer & IT Specific Branches",
        options: ["Computer Applications", "Software Engineering", "Data Science", "Artificial Intelligence", "Cybersecurity", "Cloud / DevOps", "Computer Networking"]
    },
    {
        group: "Science & General Branches",
        options: ["Physics", "Chemistry", "Mathematics", "Statistics", "Life Sciences", "General Science"]
    },
    {
        group: "Commerce & Management Branches",
        options: ["Commerce", "Accounting & Finance", "Banking", "Economics", "Business Administration", "Marketing", "Human Resource", "Operations Management"]
    },
    {
        group: "Arts & Humanities",
        options: ["English", "Psychology", "Sociology", "History", "Political Science", "General Arts"]
    },
    {
        group: "Vocational",
        options: ["Computer Operator & Programming Assistant (COPA)", "Web Technologies", "Graphic Design"]
    },
    {
        group: "Other",
        options: ["Other (Specify)"]
    }
];

const StudentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [admissionMode, setAdmissionMode] = useState('inquiry'); // 'inquiry' | 'new'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [formData, setFormData] = useState({
        inquiry: '', // ID of the inquiry (for 'inquiry' mode)

        // Fields for 'new' mode (to create inquiry first)
        name: '',
        mobile: '',
        email: '',
        college: '',
        degree: '',
        branch: '',
        passout_year: '',
        source: 'Walk-in', // Default source

        // Common fields
        enrollment_date: new Date().toISOString().split('T')[0],
        batch: '',
        course: '',
        total_fees: '',
        created_by: '', // New field for counselor assignment
    });
    const [counselors, setCounselors] = useState([]); // State for counselor list

    const [batches, setBatches] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDependencies();
        if (isEditMode) {
            fetchStudent();
        }
    }, [id]);

    const fetchDependencies = async () => {
        try {
            const batchRes = await api.get('/batches/');
            setBatches(batchRes.data);

            // Also fetch counselors for creation assignment
            const counselorRes = await api.get('/users/?role=COUNSELOR');
            setCounselors(counselorRes.data);
        } catch (err) {
            console.error("Failed to fetch dependencies", err);
        }
    };

    const fetchStudent = async () => {
        try {
            const response = await api.get(`/students/${id}/`);
            // In edit mode, we just populate the form. Mode doesn't matter as much, 
            // but we can default to 'inquiry' view or just show the student details.
            // For simplicity, we populate the common fields.
            setFormData({
                ...formData,
                inquiry: response.data.inquiry,
                mobile: response.data.mobile,
                email: response.data.email,
                enrollment_date: response.data.enrollment_date,
                batch: response.data.batch || '',
                course: response.data.course || '',
                total_fees: response.data.total_fees || '',
            });
            setTransactions(response.data.fees || []);
        } catch (err) {
            console.error("Failed to fetch student", err);
        }
    };

    const handleInquirySearch = async () => {
        if (!searchQuery) return;
        setSearchLoading(true);
        try {
            const response = await api.get(`/inquiries/?search=${searchQuery}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setSearchLoading(false);
        }
    };

    const selectInquiry = (inquiry) => {
        setFormData(prev => ({
            ...prev,
            inquiry: inquiry.id,
            mobile: inquiry.mobile,
            email: inquiry.email,
            course: inquiry.interested_course || '', // Auto-fill course
            // Clear 'new' mode fields just in case
            name: inquiry.name,
        }));
        setSearchResults([]); // Clear results to show selection
        setSearchQuery(inquiry.name); // Show name in search box
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let studentData = { ...formData };

            if (!isEditMode && admissionMode === 'new') {
                // 1. Create Inquiry First
                const inquiryPayload = {
                    name: formData.name,
                    mobile: formData.mobile,
                    email: formData.email,
                    college: formData.college,
                    degree: formData.degree,
                    branch: formData.branch,
                    passout_year: formData.passout_year,
                    interested_course: formData.course,
                    source: formData.source,
                    created_by: formData.created_by || undefined, // Pass counselor ID if selected
                };
                const inquiryRes = await api.post('/inquiries/', inquiryPayload);
                studentData.inquiry = inquiryRes.data.id;
            }

            // 2. Create/Update Student
            if (isEditMode) {
                await api.put(`/students/${id}/`, studentData);
            } else {
                await api.post('/students/', studentData);
            }
            navigate('/students');
        } catch (err) {
            console.error(err);
            setError(JSON.stringify(err.response?.data || 'An error occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{isEditMode ? 'Edit Student' : 'Admit New Student'}</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            {!isEditMode && (
                <div className="flex mb-6 bg-gray-200 p-1 rounded">
                    <button
                        className={`flex-1 py-2 rounded font-bold text-sm md:text-base ${admissionMode === 'inquiry' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setAdmissionMode('inquiry')}
                    >
                        Add from Inquiry
                    </button>
                    <button
                        className={`flex-1 py-2 rounded font-bold text-sm md:text-base ${admissionMode === 'new' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setAdmissionMode('new')}
                    >
                        New Admission
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded shadow-md mb-8">

                {/* MODE: ADD FROM INQUIRY */}
                {!isEditMode && admissionMode === 'inquiry' && (
                    <div className="mb-6 border-b pb-6">
                        <label className="block text-gray-700 font-bold mb-2">Search Inquiry</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Search by Name or Mobile"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleInquirySearch())}
                                className="flex-1 border p-2 rounded"
                            />
                            <button
                                type="button"
                                onClick={handleInquirySearch}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {searchLoading ? '...' : 'Search'}
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border rounded max-h-60 overflow-y-auto bg-gray-50">
                                {searchResults.map(inq => (
                                    <div
                                        key={inq.id}
                                        className={`p-3 border-b flex justify-between items-center ${inq.is_admitted ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-blue-50'}`}
                                        onClick={() => !inq.is_admitted && selectInquiry(inq)}
                                    >
                                        <div>
                                            <p className="font-bold">{inq.name}</p>
                                            <p className="text-sm text-gray-600">{inq.mobile} | {inq.interested_course}</p>
                                        </div>
                                        {inq.is_admitted ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">Admitted</span>
                                        ) : (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Select</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.inquiry && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
                                Selected: <strong>{formData.name || searchQuery}</strong> ({formData.mobile})
                            </div>
                        )}
                    </div>
                )}

                {/* MODE: NEW ADMISSION (Create Inquiry Fields) */}
                {!isEditMode && admissionMode === 'new' && (
                    <div className="mb-6 border-b pb-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Student Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Mobile</label>
                                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border p-2 rounded" required maxLength="10" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">College</label>
                                <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Degree</label>
                                <select name="degree" value={formData.degree} onChange={handleChange} className="w-full border p-2 rounded" required>
                                    <option value="">-- Select Degree --</option>
                                    {DEGREES.map((group, index) => (
                                        <optgroup key={index} label={group.group}>
                                            {group.options.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Branch</label>
                                <select name="branch" value={formData.branch} onChange={handleChange} className="w-full border p-2 rounded" required>
                                    <option value="">-- Select Branch --</option>
                                    {BRANCHES.map((group, index) => (
                                        <optgroup key={index} label={group.group}>
                                            {group.options.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Passout Year</label>
                                <select name="passout_year" value={formData.passout_year} onChange={handleChange} className="w-full border p-2 rounded" required>
                                    <option value="">-- Select Year --</option>
                                    {[...Array(10)].map((_, i) => {
                                        const year = new Date().getFullYear() - 5 + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMON FIELDS (Course, Fees, Batch) */}
                <h3 className="font-bold text-lg mb-4 text-gray-700">Admission Details</h3>

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
                        {Object.entries(COURSE_OPTIONS).map(([group, options]) => (
                            <optgroup key={group} label={group}>
                                {options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Total Fees (₹)</label>
                    <input
                        type="number"
                        name="total_fees"
                        value={formData.total_fees}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                        min="0"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Assign Batch</label>
                    <select
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">-- Select Batch --</option>
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Enrollment Date</label>
                    <input
                        type="date"
                        name="enrollment_date"
                        value={formData.enrollment_date}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {!isEditMode && admissionMode === 'new' && (
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Assign Counselor</label>
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
                )}

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition font-bold"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isEditMode ? 'Update Student' : 'Admit Student')}
                </button>
            </form>

            {isEditMode && (
                <div className="bg-white p-4 md:p-6 rounded shadow-md">
                    <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-700">Transaction History</h2>
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Collected By</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(tx.date_collected).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-green-600">₹{tx.amount}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.mode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{tx.utr || '-'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.collected_by_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No transactions found for this student.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentForm;
