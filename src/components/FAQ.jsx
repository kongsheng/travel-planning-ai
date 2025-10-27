import React, { useState } from 'react';

const faqData = [
  {
    id: 1,
    question: '这个 AI 旅行规划是怎么工作的？',
    answer: '只需分享你的旅行日期、目的地、预算和风格，AI 会立刻为你制定逐日计划。使用实时数据确保行程准确且始终保持最新。'
  },
  {
    id: 2,
    question: '能帮我省旅行的钱吗？',
    answer: '是的！我们会比较航班、酒店和活动的实时价格，帮你找到最划算的交易，通过优化行程避免不必要的开支。'
  },
  {
    id: 3,
    question: '适合家庭旅行吗？',
    answer: '当然可以！我们在观光和休息之间取得平衡，找到适合家庭的酒店，包括适合孩子和大人的活动安排。'
  },
  {
    id: 4,
    question: '能处理多城市或公路旅行吗？',
    answer: '完全可以！我们专门优化多城市行程和公路旅行路线，包括交通工具建议，确保沿途加入最棒的景点。'
  },
  {
    id: 5,
    question: '服务是免费的吗？',
    answer: '我们提供免费的基础旅行规划工具。高级功能可通过订阅解锁，享受更多个性化服务和专属优惠。'
  }
];

const FAQ = () => {
  const [activeId, setActiveId] = useState(null);

  const toggleFAQ = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <h2>常见问题</h2>
        <div className="faq-list">
          {faqData.map((faq) => (
            <div 
              key={faq.id} 
              className={`faq-item ${activeId === faq.id ? 'active' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
              >
                <h4>{faq.question}</h4>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
