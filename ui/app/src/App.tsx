import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './components/Authentication';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Authentication />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
