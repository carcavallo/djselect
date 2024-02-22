import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './components/Authentication';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';

function RouterComponent() {
  return (
    <>
      <Router>
          <Routes>
            <Route path="/" element={<Authentication />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
  );
}

export default RouterComponent;
