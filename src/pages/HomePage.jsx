import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { generateTripPlan } from '../services/llmService';

const HomePage = () => {
  const [notification, setNotification] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message) => {
    setNotification(message);
  };

  const handleSelectDestination = (destination) => {
    showNotification(`已为你选择 "${destination}"，继续填写其他信息吧！`);
  };

  const handlePlanTrip = async (formData) => {
    setIsGenerating(true);
    showNotification('🤖 AI 正在为你生成专属旅行规划...');

    try {
      // 调用 LLM 生成旅行规划
      const tripData = await generateTripPlan({
        destination: formData.destination,
        date: formData.date,
        days: parseInt(formData.days),
        type: formData.type
      });

      // 将生成的数据存储到 sessionStorage
      sessionStorage.setItem('tripData', JSON.stringify(tripData));
      
      showNotification('🎉 太棒了！你的旅行规划已生成！');
      
      // 短暂延迟后跳转到结果页面
      setTimeout(() => {
        navigate('/trip-result');
      }, 1000);
      
    } catch (error) {
      console.error('生成旅行规划失败:', error);
      showNotification('❌ 生成失败，请稍后重试或检查 API 配置');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 页面滚动效果
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      const currentScroll = window.pageYOffset;
      
      if (navbar) {
        if (currentScroll <= 0) {
          navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        } else {
          navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 入场动画
  useEffect(() => {
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

    const animatedElements = document.querySelectorAll(
      '.destination-card, .feature-card, .testimonial-card'
    );

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="home-page" style={{ minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      <Hero onShowNotification={showNotification} onPlanTrip={handlePlanTrip} />
      <Destinations onSelectDestination={handleSelectDestination} />
      <Features />
      <Testimonials />
      <FAQ />
      <Footer />

      {/* 通知组件 */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default HomePage;
