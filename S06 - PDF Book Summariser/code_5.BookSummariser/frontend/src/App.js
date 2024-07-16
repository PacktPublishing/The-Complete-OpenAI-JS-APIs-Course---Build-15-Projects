import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Stream from './screens/Stream'
import './App.css'
import PDFSummary from './screens/PDFSummary/PDFSummary';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={
          <Home/>
        } />
        <Route path="/stream" element={
          <Stream/>
        } />
        <Route path="/pdfsummary" element={
          <PDFSummary/>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;