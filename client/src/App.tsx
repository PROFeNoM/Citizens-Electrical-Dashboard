import React from 'react';
import './App.css';

import {HamburgerMenu} from './components';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Home, Connection, About, Legal, Error} from './pages';
import Consommation from './pages/Consommation/Consommation';
import Production from './pages/Production/Production';
import Balance from './pages/Balance/Balance';
import Bornes from './pages/Bornes/Bornes';

function App() {
    return (
        <>
            <Router>
                <HamburgerMenu/>
                <Routes>
                    <Route path='/' element={<Home />}/>
                    <Route path='/connection' element={<Connection />}/>
                    <Route path='/about' element={<About />}/>
                    <Route path='/legal' element={<Legal />}/>
                    <Route path='/balance/:zoneName' element={<Balance />}/>
                    <Route path='/consommation/:zoneName' element={<Consommation />}/>
                    <Route path='/production/:zoneName' element={<Production />}/>
                    <Route path='/bornes/:zoneName' element={<Bornes />}/>
                    <Route path='*' element={<Error />}/>
                </Routes>
            </Router>
        </>
    );
}

export default App;
