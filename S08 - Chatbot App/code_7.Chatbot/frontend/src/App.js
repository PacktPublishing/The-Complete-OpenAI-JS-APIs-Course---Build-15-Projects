import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Stream from './screens/Stream'
import './App.css'
import PDFSummary from './screens/PDFSummary/PDFSummary';
import Chat from './screens/Chat';
import Chatbot from './screens/Chatbot/Chatbot';

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
        <Route path="/chat" element={
          <Chat/>
        } />
        <Route path="/chatbot" element={
          <Chatbot/>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;