import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sessions from './components/Sessions';
import Users from './components/Users';
import Login from './components/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
