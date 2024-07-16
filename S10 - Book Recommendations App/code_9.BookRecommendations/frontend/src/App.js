import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Stream from './screens/Stream'
import Chat from './screens/Chat'
import './App.css'
import Similarity from './screens/Similarity';
import Books from './screens/Books';
// import 'bootstrap/dist/css/bootstrap.min.css';

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
        <Route path="/chat" element={
          <Chat/>
        } />
        <Route path="/similarity" element={
          <Similarity/>
        } />
        <Route path="/books" element={
          <Books/>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;