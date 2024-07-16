import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Stream from './screens/Stream'
import Chat from './screens/Chat'
import './App.css'
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
      </Routes>
    </Router>
    </>
  );
}

export default App;