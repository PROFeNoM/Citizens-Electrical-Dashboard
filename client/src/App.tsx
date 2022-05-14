import './App.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Home, About, Legal, Error } from './pages';

/**
 * Main application component.
 * 
 * @see Home
 * @see About
 * @see Legal
 * @see Error
 */
export default class App extends React.Component<{}, {}> {
    render() {
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
}
