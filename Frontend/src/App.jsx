import {Login, Signup, UploadAndDownload} from "./components/index"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Home, About, Contact} from './pages/index';

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/upload" element={<UploadAndDownload />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
  )
}

export default App