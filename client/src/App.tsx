import React from 'react';
import './App.css';

import {HamburgerMenu} from './components';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {Home, Connection, About, Legal, Error} from "./pages";
import Consommation from './pages/Consommation/Consommation';
import Production from './pages/Production/Production';
import Dropmenu from './components/Dropmenu/Dropmenu';
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
                    <Route path='/production' element={<Production />}/>
                    <Route path='/consommation' element={<Consommation />}/>

                    <Route path='*' element={<Error />}/>
                </Routes>
            </Router>
        </>
    );
}

export default App;
