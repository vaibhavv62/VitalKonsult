import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import { useContext } from 'react';
import Sidebar from './components/Sidebar';
import ManagerDashboard from './components/ManagerDashboard';
import HRDashboard from './components/HRDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import InquiryList from './pages/InquiryList';
import InquiryForm from './pages/InquiryForm';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import BatchList from './pages/BatchList';
import BatchForm from './pages/BatchForm';
import BatchDetails from './pages/BatchDetails';
import FeeList from './pages/FeeList';
import FeeForm from './pages/FeeForm';
import AttendanceList from './pages/AttendanceList';
import AttendanceForm from './pages/AttendanceForm';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';

// ... existing imports ...

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Dashboard = ({ children }) => {
  const { logout, user } = useContext(AuthContext);

  // For now, treat 'admin' as MANAGER. In real app, check user.role
  // The backend returns role in user object if we fetched profile,
  // but our login only returns tokens. We should ideally fetch profile.
  // For this MVP, let's assume if username is admin, role is MANAGER.
  const role = user?.username === 'admin' ? 'MANAGER' : user?.role || 'COUNSELOR';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />
      <div className="flex-1 ml-0 md:ml-0 overflow-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-12 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold">VitalKonsult</h1>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <span className="text-sm md:text-base">{user?.username} ({role})</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded hover:bg-red-600 text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>

          <motion.div
            key={window.location.pathname} // Simple key to trigger animation on route change if Dashboard re-renders
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children ? children : (
              <>
                {role === 'MANAGER' && <ManagerDashboard />}
                {role === 'HR_ADMIN' && <HRDashboard />}
                {role === 'TRAINER' && <TrainerDashboard />}
                {role !== 'MANAGER' && role !== 'HR_ADMIN' && role !== 'TRAINER' && <p>Role-specific dashboard coming soon...</p>}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Inquiry Routes */}
          <Route
            path="/inquiries"
            element={
              <PrivateRoute>
                <Dashboard>
                  <InquiryList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/inquiries/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <InquiryForm />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/inquiries/:id"
            element={
              <PrivateRoute>
                <Dashboard>
                  <InquiryForm />
                </Dashboard>
              </PrivateRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Dashboard>
                  <StudentList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <StudentForm />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <PrivateRoute>
                <Dashboard>
                  <StudentForm />
                </Dashboard>
              </PrivateRoute>
            }
          />

          {/* Batch Routes */}
          <Route
            path="/batches"
            element={
              <PrivateRoute>
                <Dashboard>
                  <BatchList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/batches/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <BatchForm />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/batches/:id"
            element={
              <PrivateRoute>
                <Dashboard>
                  <BatchForm />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/batches/:id/view"
            element={
              <PrivateRoute>
                <Dashboard>
                  <BatchDetails />
                </Dashboard>
              </PrivateRoute>
            }
          />

          {/* Fee Routes */}
          <Route
            path="/fees"
            element={
              <PrivateRoute>
                <Dashboard>
                  <FeeList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/fees/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <FeeForm />
                </Dashboard>
              </PrivateRoute>
            }
          />

          {/* Attendance Routes */}
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Dashboard>
                  <AttendanceList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance/mark/:batchId"
            element={
              <PrivateRoute>
                <Dashboard>
                  <AttendanceForm />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <AttendanceForm />
                </Dashboard>
              </PrivateRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Dashboard>
                  <UserList />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <PrivateRoute>
                <Dashboard>
                  <UserForm />
                </Dashboard>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
