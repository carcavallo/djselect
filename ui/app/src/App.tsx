import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authorization from './components/Authorization';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authorization />} />
      </Routes>
    </Router>
  );
}

export default App;
