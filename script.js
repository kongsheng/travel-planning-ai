// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// FAQ 展开/折叠
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // 关闭所有其他的 FAQ
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 切换当前 FAQ
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// 旅行表单提交
document.getElementById('travelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 显示加载动画
    const button = e.target.querySelector('.btn-primary');
    const originalText = button.textContent;
    button.textContent = '✨ 正在规划中...';
    button.disabled = true;
    
    // 模拟 API 调用
    setTimeout(() => {
        // 显示成功消息
        showNotification('🎉 太棒了！你的旅行规划已生成！我们会尽快发送到你的邮箱。');
        
        // 重置按钮
        button.textContent = originalText;
        button.disabled = false;
        
        // 重置表单
        e.target.reset();
    }, 2000);
});

// 目的地卡片点击
document.querySelectorAll('.destination-card .btn-outline').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.destination-card');
        const destination = card.querySelector('h4').textContent;
        
        // 滚动到表单区域
        document.querySelector('#home').scrollIntoView({
            behavior: 'smooth'
        });
        
        // 填充目的地
        setTimeout(() => {
            const input = document.querySelector('#travelForm input[type="text"]');
            input.value = destination;
            input.focus();
            showNotification(`已为你选择 "${destination}"，继续填写其他信息吧！`);
        }, 800);
    });
});

// 通知提示函数
function showNotification(message) {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面滚动效果
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// 添加入场动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
document.querySelectorAll('.destination-card, .feature-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

console.log('🚀 旅行 AI 网站已加载完成！');
