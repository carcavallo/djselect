import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authorization from './components/Authorization';

function App() {
  return (
    <Router>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Authorization />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
