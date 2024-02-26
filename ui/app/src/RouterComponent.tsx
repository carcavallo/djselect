import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './components/Authentication';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import SetNewPassword from './components/forms/SetNewPassword';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function RouterComponent() {
  return (
    <AuthProvider>
      <>
        <Router>
            <Routes>
              <Route path="/" element={<Authentication />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/reset-password" element={<SetNewPassword />} />
            </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          rtl={false}
          pauseOnFocusLoss
          theme="dark"
        />
      </>
    </AuthProvider>
  );
}

export default RouterComponent;
