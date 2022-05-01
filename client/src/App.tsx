import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, About, Legal, Error } from './pages';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/legal' element={<Legal />} />
                    <Route path='*' element={<Error />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
