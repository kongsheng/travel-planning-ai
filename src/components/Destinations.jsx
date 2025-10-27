import React from 'react';

const destinationsData = [
  {
    id: 1,
    title: '巴黎浪漫之旅',
    description: '7天艺术与美食探索',
    icon: '🗼',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: '日本文化体验',
    description: '10天传统与现代碰撞',
    icon: '🗾',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: '东南亚海岛游',
    description: '14天阳光沙滩与冒险',
    icon: '🏖️',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: '瑞士山地探险',
    description: '5天雪山与湖泊之旅',
    icon: '🏔️',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
];

const Destinations = ({ onSelectDestination }) => {
  const handleSelect = (title) => {
    // 滚动到表单区域
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 延迟通知
    setTimeout(() => {
      onSelectDestination(title);
    }, 800);
  };

  return (
    <section id="destinations" className="destinations">
      <div className="container">
        <h2>接下来去哪儿？</h2>
        <div className="destinations-grid">
          {destinationsData.map((destination) => (
            <div key={destination.id} className="destination-card">
              <div 
                className="destination-image" 
                style={{ background: destination.gradient }}
              >
                <span className="destination-icon">{destination.icon}</span>
              </div>
              <h4>{destination.title}</h4>
              <p>{destination.description}</p>
              <button 
                className="btn-outline"
                onClick={() => handleSelect(destination.title)}
              >
                开始规划
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
