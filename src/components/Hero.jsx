import React, { useState } from 'react';

const Hero = ({ onShowNotification, onPlanTrip }) => {
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    days: '',
    type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 将表单数据传递给父组件
    if (onPlanTrip) {
      onPlanTrip(formData);
    }
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="ai-avatar">🤖</div>
          <h1>嘿，我是你的 AI 旅行顾问</h1>
          <p className="hero-subtitle">几分钟内完成您的旅行规划，而不是几周</p>
          
          <div className="planning-card">
            <h3>开始规划你的旅行</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input 
                  type="text" 
                  name="destination"
                  placeholder="目的地，例如：日本、巴黎" 
                  value={formData.destination}
                  onChange={handleChange}
                  required 
                />
                <input 
                  type="date" 
                  name="date"
                  placeholder="出发日期" 
                  value={formData.date}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-row">
                <input 
                  type="number" 
                  name="days"
                  placeholder="天数" 
                  min="1" 
                  max="30" 
                  value={formData.days}
                  onChange={handleChange}
                  required 
                />
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">旅行类型</option>
                  <option value="family">家庭旅行</option>
                  <option value="couple">情侣旅行</option>
                  <option value="solo">独自旅行</option>
                  <option value="adventure">冒险探索</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? '✨ 正在规划中...' : '✨ 智能规划我的旅行'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
