import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authentication from "./components/Authentication";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import SetNewPassword from "./components/forms/SetNewPassword";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/forms/EditProfile";
import EventDetail from "./components/EventDetail";
import CreateEvent from "./components/forms/CreateEvent";
import EditEvent from "./components/forms/EditEvent";
import EventBookings from "./components/forms/EventBookings";

function RouterComponent() {
  return (
    <AuthProvider>
      <>
        <Router>
<<<<<<< HEAD
            <Routes>
              <Route path="/" element={<Authentication />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reset" element={<SetNewPassword />} />
                <Route path="/profile" element={<EditProfile />} />
                <Route path="/events/:eventId" element={<EventDetail />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/edit-event/:eventId" element={<EditEvent />} />
                <Route path="/event-requests/:eventId" element={<EventBookings />} />
              </Route>
            </Routes>
=======
          <Routes>
            <Route path="/" element={<Authentication />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/reset" element={<SetNewPassword />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event/:eventId" element={<EditEvent />} />
            <Route
              path="/event-requests/:eventId"
              element={<EventBookings />}
            />
          </Routes>
>>>>>>> db9b70d5a3bf0999b7913e1d24a88e2b3ced00ad
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
