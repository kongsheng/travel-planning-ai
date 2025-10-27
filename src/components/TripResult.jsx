import React, { useState, useEffect } from 'react';
import './TripResult.css';

const TripResult = ({ tripData, onBack }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // 下载 PDF 功能
  const handleDownloadPDF = async () => {
    try {
      console.log('开始生成PDF...');
      
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF 生成失败');
      }

      // 获取PDF文件内容
      const blob = await response.blob();
      console.log('PDF Blob大小:', blob.size, 'bytes');
      console.log('Blob类型:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('PDF文件为空');
      }
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title}_${Date.now()}.pdf`;
      
      // 触发下载
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ PDF下载成功');
      
    } catch (error) {
      console.error('下载 PDF 失败:', error);
      alert(`PDF 生成失败: ${error.message}`);
    }
  };

  // 分享行程功能
  const handleShare = () => {
    // 生成分享链接（包含行程数据）
    const tripId = Date.now().toString(36);
    // 使用localStorage存储，这样可以跨标签页访问
    localStorage.setItem(`trip-${tripId}`, JSON.stringify(data));
    // 设置24小时后自动过期
    localStorage.setItem(`trip-${tripId}-expire`, (Date.now() + 24 * 60 * 60 * 1000).toString());
    const link = `${window.location.origin}/trip-result?id=${tripId}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // 活动类型图标映射（处理 LLM 返回的各种格式）
  const getActivityIcon = (icon, activityName, description) => {
    // 如果已经是有效的 emoji，直接返回
    if (icon && /[\p{Emoji}]/u.test(icon) && icon.length <= 4) {
      return icon;
    }

    // 根据活动名称和描述智能匹配图标
    const text = `${activityName || ''} ${description || ''}`.toLowerCase();
    
    // 常见活动类型映射
    const iconMap = {
      // 文化历史
      '故宫|博物馆|皇宫|宫殿|古迹|遗址|寺庙|教堂|清真寺': '🏛️',
      '长城|城墙|古城|要塞': '🏰',
      '天坛|祭坛|祈年殿': '⛩️',
      
      // 现代景点
      '天安门|广场|公园|花园': '🌳',
      '购物|商场|市场|商业街|王府井': '🛍️',
      '艺术|画廊|展览': '🎨',
      '剧院|演出|表演|京剧': '🎭',
      
      // 餐饮
      '午餐|午饭|午|中餐|用餐': '🍜',
      '晚餐|晚饭|晚|晚饭': '🍱',
      '早餐|早饭|早': '🥐',
      '小吃|美食|特色菜|烤鸭': '🍲',
      '咖啡|茶|饮品|下午茶': '☕',
      
      // 娱乐休闲
      '夜游|夜景|灯光秀': '🌃',
      '游船|船游|乘船': '⛵',
      '散步|漫步|闲逛': '🚶',
      '骑行|自行车': '🚴',
      
      // 交通
      '机场|航班|飞机': '✈️',
      '高铁|火车|地铁': '🚄',
      '出租车|打车': '🚕',
      
      // 住宿
      '入住|酒店|住宿|休息': '🏨',
      
      // 其他
      '升旗|仪式|典礼': '🎌',
      '拍照|摄影|打卡': '📸',
      '导览|讲解|参观': '👥'
    };

    // 匹配图标
    for (const [keywords, emoji] of Object.entries(iconMap)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => text.includes(keyword))) {
        return emoji;
      }
    }

    // 根据时间段返回默认图标
    if (text.includes('上午') || text.includes('早')) return '🌅';
    if (text.includes('中午') || text.includes('午')) return '🍜';
    if (text.includes('下午')) return '☀️';
    if (text.includes('傍晚') || text.includes('晚')) return '🌆';

    // 最终默认图标
    return '📍';
  };

  // 图片错误处理 - 使用可靠的占位图
  const handleImageError = (e) => {
    // 使用 Picsum 随机图片作为兜底
    const randomNum = Math.floor(Math.random() * 100) + 1;
    e.target.src = `https://picsum.photos/800/600?random=${randomNum}`;
    // 防止无限循环
    e.target.onerror = null;
  };

  useEffect(() => {
    // 1. 首先检查URL参数中是否有分享的行程ID
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTripId = urlParams.get('id');
    
    if (sharedTripId) {
      // 从localStorage读取分享的行程数据
      const sharedData = localStorage.getItem(`trip-${sharedTripId}`);
      const expireTime = localStorage.getItem(`trip-${sharedTripId}-expire`);
      
      // 检查是否过期
      if (expireTime && Date.now() > parseInt(expireTime)) {
        console.warn('分享链接已过期');
        localStorage.removeItem(`trip-${sharedTripId}`);
        localStorage.removeItem(`trip-${sharedTripId}-expire`);
      } else if (sharedData) {
        try {
          const parsedData = JSON.parse(sharedData);
          console.log('📊 加载分享的旅行数据:', parsedData);
          setData(parsedData);
          if (parsedData.destinations && parsedData.destinations[0]) {
            setSelectedDay(`${parsedData.destinations[0].id}-0`);
          }
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('解析分享数据失败:', error);
        }
      } else {
        console.warn('未找到分享的行程数据，ID:', sharedTripId);
      }
    }
    
    // 2. 从 props 或 sessionStorage 获取数据
    if (tripData) {
      console.log('📊 加载的旅行数据:', tripData);
      if (tripData.destinations && tripData.destinations[0]) {
        console.log('🖼️ 城市图片URL:', tripData.destinations[0].image);
      }
      if (tripData.hotels && tripData.hotels[0]) {
        console.log('🏨 酒店图片URL:', tripData.hotels[0].image);
      }
      setData(tripData);
      // 默认选中第一天（使用正确的格式：destination.id-dayIndex）
      if (tripData.destinations && tripData.destinations[0]) {
        setSelectedDay(`${tripData.destinations[0].id}-0`);
      }
      setIsLoading(false);
    } else {
      const storedData = sessionStorage.getItem('tripData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('📊 从存储加载的数据:', parsedData);
          if (parsedData.destinations && parsedData.destinations[0]) {
            console.log('🖼️ 城市图片URL:', parsedData.destinations[0].image);
          }
          if (parsedData.hotels && parsedData.hotels[0]) {
            console.log('🏨 酒店图片URL:', parsedData.hotels[0].image);
          }
          setData(parsedData);
          // 默认选中第一天
          if (parsedData.destinations && parsedData.destinations[0]) {
            setSelectedDay(`${parsedData.destinations[0].id}-0`);
          }
        } catch (error) {
          console.error('解析存储数据失败:', error);
          const defaultData = getDefaultTripData();
          setData(defaultData);
          if (defaultData.destinations && defaultData.destinations[0]) {
            setSelectedDay(`${defaultData.destinations[0].id}-0`);
          }
        }
      } else {
        // 使用默认数据
        const defaultData = getDefaultTripData();
        setData(defaultData);
        // 默认选中第一天
        if (defaultData.destinations && defaultData.destinations[0]) {
          setSelectedDay(`${defaultData.destinations[0].id}-0`);
        }
      }
      setIsLoading(false);
    }
  }, [tripData]);

  // 默认数据
  const getDefaultTripData = () => ({
    title: '5天西班牙安达卢西亚公路旅行',
    summary: {
      days: 5,
      destinations: 3,
      travelers: 2
    },
    destinations: [
      {
        id: 1,
        city: '塞维利亚',
        country: '西班牙',
        description: '塞维利亚是一座充满活力的城市，以其丰富的历史、令人惊叹的建筑和热情的弗拉明戈文化而闻名。',
        image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
        days: [
          {
            date: '5月22日',
            title: '历史塞维利亚和标志性古迹',
            activities: [
              {
                time: '上午',
                name: '塞维利亚大教堂导览',
                description: '参观塞维利亚大教堂、吉拉尔达塔和皇家城堡，享受免排队通道。',
                icon: '🏛️',
                duration: '3小时'
              },
              {
                time: '中午',
                name: 'El Rinconcillo 午餐',
                description: '在塞维利亚最古老的小酒馆享用正宗安达卢西亚美食。',
                icon: '🍽️',
                duration: '1.5小时'
              },
              {
                time: '下午',
                name: '西班牙广场漫步',
                description: '参观西班牙广场和玛丽亚·路易莎公园，完美的散步和拍照地点。',
                icon: '🌳',
                duration: '2小时'
              },
              {
                time: '傍晚',
                name: '屋顶酒吧观景',
                description: '在 La Terraza de EME 欣赏大教堂美景，享用饮品。',
                icon: '🍹',
                duration: '1小时'
              }
            ],
            accommodation: 'Eurostars Sevilla Boutique'
          },
          {
            date: '5月23日',
            title: '文化瑰宝和弗拉明戈体验',
            activities: [
              {
                time: '上午',
                name: '特里亚纳区探索',
                description: '探索充满活力的特里亚纳社区，以其陶瓷工坊和热闹氛围而闻名。',
                icon: '🎨',
                duration: '2小时'
              },
              {
                time: '中午',
                name: '米其林餐厅午餐',
                description: '在 Egaña-Oriza 品尝现代安达卢西亚美食。',
                icon: '⭐',
                duration: '2小时'
              },
              {
                time: '下午',
                name: '参观斗牛场',
                description: '参观塞维利亚斗牛场，了解西班牙斗牛历史。',
                icon: '🎭',
                duration: '1.5小时'
              },
              {
                time: '晚上',
                name: '弗拉明戈表演',
                description: '在 Baraka Sala Flamenca 欣赏正宗的弗拉明戈表演。',
                icon: '💃',
                duration: '1.5小时'
              }
            ],
            accommodation: 'Eurostars Sevilla Boutique'
          }
        ]
      },
      {
        id: 2,
        city: '格拉纳达',
        country: '西班牙',
        description: '格拉纳达以令人惊叹的阿尔罕布拉宫和美丽的摩尔建筑而闻名，是西班牙南部的必游之地。',
        image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
        days: [
          {
            date: '5月24日',
            title: '探索阿尔罕布拉宫和历史格拉纳达',
            activities: [
              {
                time: '上午',
                name: '阿尔罕布拉宫导览',
                description: '参观阿尔罕布拉宫、纳斯里德宫殿和赫内拉利费花园。',
                icon: '🏰',
                duration: '3小时'
              },
              {
                time: '中午',
                name: '阿尔拜辛区午餐',
                description: '在 Carmen Mirador de Aixa 享用午餐，欣赏阿尔罕布拉宫全景。',
                icon: '🍽️',
                duration: '1.5小时'
              },
              {
                time: '下午',
                name: '阿尔拜辛漫步',
                description: '在迷人的阿尔拜辛社区漫步，欣赏狭窄街道和美景。',
                icon: '🚶',
                duration: '2小时'
              },
              {
                time: '傍晚',
                name: '圣尼古拉斯观景台日落',
                description: '在 Mirador de San Nicolás 欣赏城市和阿尔罕布拉宫的日落美景。',
                icon: '🌅',
                duration: '1小时'
              }
            ],
            accommodation: 'ROOMS Los MONTES'
          }
        ]
      },
      {
        id: 3,
        city: '马拉加',
        country: '西班牙',
        description: '马拉加是太阳海岸上一座充满活力的城市，以其美丽的海滩、历史遗迹和活跃的文化场景而闻名。',
        image: 'https://images.unsplash.com/photo-1583085004484-b6658ba3d8d4?w=800',
        days: [
          {
            date: '5月26日',
            title: '历史马拉加和当地风味',
            activities: [
              {
                time: '上午',
                name: '阿尔卡萨巴和罗马剧院',
                description: '探索阿尔卡萨巴堡垒和罗马剧院，沉浸在马拉加的丰富历史中。',
                icon: '🏛️',
                duration: '1.5小时'
              },
              {
                time: '中午',
                name: 'El Pimpi 午餐',
                description: '在 El Pimpi 享用传统安达卢西亚美食和小吃。',
                icon: '🍷',
                duration: '1.5小时'
              },
              {
                time: '下午',
                name: '阿塔拉萨纳斯市场',
                description: '在熙熙攘攘的市场漫步，体验当地新鲜农产品和热闹氛围。',
                icon: '🛒',
                duration: '1小时'
              },
              {
                time: '傍晚',
                name: '马拉加公园散步',
                description: '在美丽的马拉加公园放松身心，享受绿色空间。',
                icon: '🌳',
                duration: '1小时'
              }
            ],
            accommodation: 'Gce Hoteles'
          }
        ]
      }
    ],
    hotels: [
      {
        name: 'Eurostars Sevilla Boutique',
        city: '塞维利亚',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        description: '酒店设有休闲或商务活动的休息室，以及季节性开放的露台咖啡吧，可欣赏吉拉尔达和大教堂的壮丽景色。'
      },
      {
        name: 'ROOMS Los MONTES',
        city: '格拉纳达',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        description: '位于市中心，距离格拉纳达大教堂500米，步行15分钟即可到达阿尔罕布拉宫。提供免费Wi-Fi和空调客房。'
      },
      {
        name: 'Gce Hoteles',
        city: '马拉加',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
        description: '距离马拉加市中心20分钟车程，提供免费Wi-Fi。所有客房均隔音，配有平板电视和私人浴室。'
      }
    ]
  });

  if (isLoading) {
    return (
      <div className="trip-result">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载旅行规划...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="trip-result">
        <div className="error-container">
          <p>❌ 无法加载旅行规划数据</p>
          <button onClick={onBack} className="btn-primary">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-result">
      {/* 顶部标题栏 */}
      <div className="trip-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="trip-title-section">
          <h1>{data.title}</h1>
          <div className="trip-meta">
            <span>📅 {data.summary.days} 天</span>
            <span>📍 {data.summary.destinations} 个目的地</span>
            <span>👥 {data.summary.travelers} 人</span>
          </div>
          <div className="trip-actions">
            <button className="btn-action" onClick={handleDownloadPDF}>📥 下载 PDF</button>
            <button className="btn-action" onClick={handleShare}>🔗 分享行程</button>
          </div>
        </div>
      </div>

      {/* 行程概览 */}
      <div className="trip-container">
        {/* 左侧：目的地时间线 */}
        <div className="trip-sidebar">
          <h3>📍 行程路线</h3>
          <div className="destinations-timeline">
            {data.destinations.map((dest, index) => (
              <div key={dest.id} className="timeline-item">
                <div className="timeline-marker">{index + 1}</div>
                <div className="timeline-content">
                  <h4>{dest.city}</h4>
                  <p>{dest.days.length} 天</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：详细行程 */}
        <div className="trip-content">
          {/* 目的地循环 */}
          {data.destinations.map((destination) => (
            <div key={destination.id} className="destination-section">
              <div className="destination-header">
                <img 
                  src={destination.image} 
                  alt={destination.city}
                  onError={handleImageError}
                />
                <div className="destination-info">
                  <h2>{destination.city}, {destination.country}</h2>
                  <p>{destination.description}</p>
                </div>
              </div>

              {/* 每日行程 */}
              {destination.days.map((day, dayIndex) => (
                <div key={dayIndex} className="day-card">
                  <div className="day-header">
                    <div className="day-date">
                      <span className="date-badge">{day.date}</span>
                      <h3>{day.title}</h3>
                    </div>
                    <button 
                      className={`expand-btn ${selectedDay === `${destination.id}-${dayIndex}` ? 'active' : ''}`}
                      onClick={() => setSelectedDay(selectedDay === `${destination.id}-${dayIndex}` ? null : `${destination.id}-${dayIndex}`)}
                    >
                      {selectedDay === `${destination.id}-${dayIndex}` ? '−' : '+'}
                    </button>
                  </div>

                  {selectedDay === `${destination.id}-${dayIndex}` && (
                    <div className="day-activities">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="activity-item">
                          <div className="activity-icon">
                            {getActivityIcon(activity.icon, activity.name, activity.description)}
                          </div>
                          <div className="activity-details">
                            <div className="activity-time-badge">{activity.time}</div>
                            <h4>{activity.name}</h4>
                            <p>{activity.description}</p>
                            <span className="activity-duration">⏱️ {activity.duration}</span>
                          </div>
                        </div>
                      ))}
                      <div className="accommodation-info">
                        <span>🏨 住宿：{day.accommodation}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* 酒店推荐 */}
          <div className="hotels-section">
            <h2>🏨 精选住宿</h2>
            <div className="hotels-grid">
              {data.hotels.map((hotel, index) => (
                <div key={index} className="hotel-card">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    onError={handleImageError}
                  />
                  <div className="hotel-info">
                    <h4>{hotel.name}</h4>
                    <p className="hotel-city">📍 {hotel.city}</p>
                    <p className="hotel-desc">{hotel.description}</p>
                    <button className="btn-book">查看详情</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>🔗 分享旅行计划</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-modal-body">
              <p>复制下方链接分享给朋友：</p>
              <div className="share-link-container">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="share-link-input"
                  onClick={(e) => e.target.select()}
                />
                <button 
                  className={`copy-btn ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copySuccess ? '✓ 已复制' : '📋 复制'}
                </button>
              </div>
              <p className="share-tip">💡 提示：链接有效期为24小时</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripResult;
