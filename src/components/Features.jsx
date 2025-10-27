import React from 'react';

const featuresData = [
  {
    id: 1,
    icon: '🎯',
    title: '量身定制',
    description: '根据你的喜好和旅行风格量身定制行程，确保每一刻都难忘且完美契合你的愿望。'
  },
  {
    id: 2,
    icon: '💰',
    title: '更便宜',
    description: '帮你找到最好的优惠和折扣，从便宜的航班到打折的住宿，让旅行既愉快又划算。'
  },
  {
    id: 3,
    icon: '💎',
    title: '隐藏的宝藏',
    description: '发现隐藏的宝藏和不为人知的目的地，探索独特景点和当地秘密，体验真实之美。'
  },
  {
    id: 4,
    icon: '✅',
    title: '没有惊喜',
    description: '确保一切顺利进行，从航班到住宿，专业规划保证无忧体验，让你专注于创造回忆。'
  }
];

const Features = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <h2>我会在每一步都支持你</h2>
        <div className="features-grid">
          {featuresData.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
