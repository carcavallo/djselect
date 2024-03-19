import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authentication from "./components/authentication/Authentication";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import SetNewPassword from "./components/forms/SetNewPassword";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/authentication/AuthContext";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import EditProfile from "./components/forms/EditProfile";
import EventDetail from "./components/forms/EventDetail";
import CreateEvent from "./components/forms/CreateEvent";
import EditEvent from "./components/forms/EditEvent";
import EventBookings from "./components/forms/EventBookings";
import EditUser from "./components/forms/EditUser";

function RouterComponent() {
  return (
    <AuthProvider>
      <>
        <Router>
          <Routes>
            <Route path="/" element={<Authentication />} />
            <Route path="/reset" element={<SetNewPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<EditProfile />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/edit-event/:eventId" element={<EditEvent />} />
              <Route
                path="/event-requests/:eventId"
                element={<EventBookings />}
              />
              <Route path="/user/:userId" element={<EditUser />} />
            </Route>
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
