import React from 'react';
import './App.css';

import { HamburgerMenu } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Connection, About, Legal, Error } from './pages';
import Consumption from './pages/Consumption/Consumption';
import Production from './pages/Production/Production';
import Stations from './pages/Stations/Stations';

function App() {
    return (
        <>
            <Router>
                <HamburgerMenu />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/connection' element={<Connection />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/legal' element={<Legal />} />
                    <Route path='/consommation/:zoneName/:build' element={<Consumption />} />
                    <Route path='/production/:zoneName/:build' element={<Production />} />
                    <Route path='/bornes/:zoneName' element={<Stations />} />
                    <Route path='*' element={<Error />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
