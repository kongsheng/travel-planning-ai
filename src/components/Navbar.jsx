import React from 'react';

const Navbar = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">✈️ 旅行 AI</div>
        <div className="nav-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>首页</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>特点</a>
          <a href="#destinations" onClick={(e) => { e.preventDefault(); scrollToSection('destinations'); }}>目的地</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>常见问题</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
