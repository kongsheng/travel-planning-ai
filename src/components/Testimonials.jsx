import React from 'react';

const testimonialsData = [
  {
    id: 1,
    rating: 5,
    text: '这个 AI 旅行助手在几分钟内为我们的家庭度假制定了完美的个性化行程，太棒了！',
    avatar: '👨',
    name: '张先生',
    type: '家庭旅行'
  },
  {
    id: 2,
    rating: 5,
    text: '作为忙碌的上班族，这个工具节省了我大量研究时间，还提供了超棒的体验推荐。',
    avatar: '👩',
    name: '李女士',
    type: '独自旅行'
  },
  {
    id: 3,
    rating: 5,
    text: '规划蜜月旅行从未如此简单，AI 处理所有细节，比传统旅行社更专业！',
    avatar: '💑',
    name: '王先生 & 陈女士',
    type: '蜜月旅行'
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>旅客们的评价</h2>
        <div className="testimonials-grid">
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-stars">
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p>"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
