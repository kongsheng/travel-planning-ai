import React from 'react';

const footerData = {
  company: [
    { name: '关于我们', href: '#' },
    { name: '博客', href: '#' },
    { name: '联系我们', href: '#' }
  ],
  product: [
    { name: '功能特点', href: '#' },
    { name: '定价', href: '#' },
    { name: '常见问题', href: '#' }
  ],
  legal: [
    { name: '隐私政策', href: '#' },
    { name: '服务条款', href: '#' }
  ]
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>✈️ 旅行 AI</h4>
            <p>用 AI 智能规划你的完美旅程</p>
          </div>
          <div className="footer-section">
            <h4>公司</h4>
            {footerData.company.map((link, index) => (
              <a key={index} href={link.href}>{link.name}</a>
            ))}
          </div>
          <div className="footer-section">
            <h4>产品</h4>
            {footerData.product.map((link, index) => (
              <a key={index} href={link.href}>{link.name}</a>
            ))}
          </div>
          <div className="footer-section">
            <h4>法律</h4>
            {footerData.legal.map((link, index) => (
              <a key={index} href={link.href}>{link.name}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 旅行 AI. 用 ❤️ 打造</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
