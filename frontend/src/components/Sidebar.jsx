import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const navLinks = (
        <ul className="space-y-2">
            {role === 'HR_ADMIN' && (
                <>
                    <li>
                        <Link to="/dashboard" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/inquiries" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Inquiries
                        </Link>
                    </li>
                </>
            )}

            {role !== 'HR_ADMIN' && (
                <li>
                    <Link to="/dashboard" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                        Dashboard
                    </Link>
                </li>
            )}

            {(role === 'COUNSELOR' || role === 'MANAGER') && (
                <li>
                    <Link to="/inquiries" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                        Inquiries
                    </Link>
                </li>
            )}

            {(role === 'HR_ADMIN' || role === 'MANAGER') && (
                <>
                    <li>
                        <Link to="/admissions" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Admissions
                        </Link>
                    </li>
                    <li>
                        <Link to="/students" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Students
                        </Link>
                    </li>
                    <li>
                        <Link to="/fees" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Fees
                        </Link>
                    </li>
                    <li>
                        <Link to="/batches" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                            Batches
                        </Link>
                    </li>
                </>
            )}

            {(role === 'TRAINER' || role === 'MANAGER') && (
                <li>
                    <Link to="/attendance" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                        Attendance History
                    </Link>
                </li>
            )}

            {(role === 'PLACEMENT_OFFICER' || role === 'MANAGER') && (
                <li>
                    <Link to="/placements" onClick={closeSidebar} className="block p-2 hover:bg-gray-700 rounded">
                        Placements
                    </Link>
                </li>
            )}
        </ul>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40
                w-64 bg-gray-800 text-white min-h-screen p-4
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <h2 className="text-2xl font-bold mb-8 text-center mt-12 md:mt-0">VitalKonsult</h2>
                <nav>
                    {navLinks}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
