import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Stream from './screens/Stream'
import './App.css'
import PDFSummary from './screens/PDFSummary/PDFSummary';
import Chat from './screens/Chat';
import Chatbot from './screens/Chatbot/Chatbot';
import Similarity from './screens/Similarity';
import Books from './screens/Books/Books';
import PDFChat from './screens/PDFChat/PDFChat';

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
        <Route path="/similarity" element={
          <Similarity/>
        } />
        <Route path="/books" element={
          <Books/>
        } />
        <Route path="/chatwithpdf" element={
          <PDFChat/>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;