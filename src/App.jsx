import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TnebCalculator from './pages/TnebCalculator';

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('krish_tech_theme');
    if (saved) return saved;
    const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefers ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('krish_tech_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tneb-calculator" element={<TnebCalculator />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
