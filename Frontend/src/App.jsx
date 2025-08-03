import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Home, 
      About, 
      Contact, 
      UploadPage, 
      LoginPage, 
      SignupPage,
      UserDashboard as Dashboard,
} from './pages/index';

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
  )
}

export default App