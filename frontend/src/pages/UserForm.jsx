import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'COUNSELOR', // Default role
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const ROLES = [
        { value: 'COUNSELOR', label: 'Counselor' },
        { value: 'TRAINER', label: 'Trainer' },
        { value: 'HR_ADMIN', label: 'HR Admin' },
        { value: 'PLACEMENT_OFFICER', label: 'Placement Officer' },
        { value: 'MANAGER', label: 'Manager' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/users/', formData);
            Swal.fire({
                icon: 'success',
                title: 'User Created',
                text: 'New team member added successfully.',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/users');
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: 'Failed to create user. Username/Email might already exist.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Add New Team Member</h1>


            {/* Error display removed, using SweetAlert2 instead */}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Username</label>
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-bold mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-bold mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-bold mb-2">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        {ROLES.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-bold mb-2">Phone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
