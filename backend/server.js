const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const https = require('https');
const PDFService = require('./pdfService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 创建持久化的 HTTP Agent（复用连接，避免首次请求慢）
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // 保持连接30秒
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000
});

// 中间件
app.use(cors());
app.use(express.json());

// 百度/Pexels 图片搜索服务（无需API Key或使用免费Pexels API）
class ImageSearchService {
  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.usePexels = !!this.pexelsApiKey;
    this.useUnsplash = !!this.unsplashAccessKey;
    this.httpsAgent = httpsAgent; // 使用全局 agent
    // 预设城市图片库（高质量真实图片）
    this.cityImageMap = {
      '北京': 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800',
      '北京 地标': 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800',
      '故宫': 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800',
      '长城': 'https://images.pexels.com/photos/2893685/pexels-photo-2893685.jpeg?auto=compress&w=800',
      '天坛': 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&w=800',
      '上海': 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&w=800',
      '外滩': 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&w=800',
      '东方明珠': 'https://images.pexels.com/photos/2412611/pexels-photo-2412611.jpeg?auto=compress&w=800',
      '杭州': 'https://images.pexels.com/photos/2096750/pexels-photo-2096750.jpeg?auto=compress&w=800',
      '西湖': 'https://images.pexels.com/photos/2096750/pexels-photo-2096750.jpeg?auto=compress&w=800',
      '广州': 'https://images.pexels.com/photos/2412610/pexels-photo-2412610.jpeg?auto=compress&w=800',
      '深圳': 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&w=800',
      '成都': 'https://images.pexels.com/photos/2901046/pexels-photo-2901046.jpeg?auto=compress&w=800',
      '西安': 'https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&w=800',
      '南京': 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg?auto=compress&w=800',
      '重庆': 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&w=800',
      '天津': 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&w=800',
      '苏州': 'https://images.pexels.com/photos/2901215/pexels-photo-2901215.jpeg?auto=compress&w=800',
    };
    
    this.hotelImages = [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800',
      'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&w=800',
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&w=800',
    ];
  }

  // 搜索图片（优先使用 Pexels API）
  async searchImage(keyword, type = 'city') {
    console.log(`🔍 搜索图片: ${keyword} (类型: ${type})`);
    // 优先使用 Unsplash API（如果已配置）
    if (this.useUnsplash) {
      try {
        const unsplashResult = await this.searchUnsplash(keyword);
        if (unsplashResult) {
          console.log(`✅ Unsplash搜索成功`);
          return unsplashResult;
        }
      } catch (error) {
        console.log(`⚠️ Unsplash搜索失败: ${error.message}`);
      }
    }
    // 其次使用 Pexels API（如果已配置）
    if (this.usePexels) {
      try {
        let searchQuery;
        if (type === 'hotel') {
          searchQuery = keyword;
        } else {
          searchQuery = keyword;
        }
        console.log(`🔎 使用Pexels搜索: "${searchQuery}"`);
        const pexelsResult = await this.searchPexels(searchQuery);
        if (pexelsResult) {
          console.log(`✅ Pexels搜索成功`);
          return pexelsResult;
        }
  // Unsplash API 搜索

        
        // 如果中文搜索没有结果，尝试英文降级
        console.log(`⚠️ 中文搜索无结果，尝试英文...`);
        
        if (type === 'hotel') {
          // 酒店降级策略：尝试多个英文关键词
          const hotelQueries = [
            'luxury hotel lobby',
            'hotel room interior', 
            'five star hotel'
          ];
          
          for (const query of hotelQueries) {
            console.log(`🔎 尝试英文搜索: "${query}"`);
            const result = await this.searchPexels(query);
            if (result) {
              console.log(`✅ 英文搜索成功`);
              return result;
            }
          }
        } else {
          // 城市降级：使用英文城市名 + 特定地标
          const cityNameMap = {
            '北京': 'beijing tiananmen square',
            '上海': 'shanghai oriental pearl tower', 
            '杭州': 'hangzhou west lake pagoda',
            '广州': 'guangzhou canton tower night',
            '深圳': 'shenzhen ping an tower',
            '成都': 'chengdu giant panda',
            '西安': 'xian bell tower ancient',
            '南京': 'nanjing confucius temple',
            '重庆': 'chongqing hongya cave',
            '天津': 'tianjin eye ferris wheel',
            '苏州': 'suzhou classical garden',
            '武汉': 'wuhan yellow crane tower',
            '长沙': 'changsha orange island',
            '济南': 'jinan daming lake',
            '哈尔滨': 'harbin saint sophia cathedral',
            '青岛': 'qingdao zhan bridge seaside',
            '厦门': 'xiamen gulangyu island',
            '大连': 'dalian xinghai square',
            '沈阳': 'shenyang imperial palace',
            '昆明': 'kunming dianchi lake',
            '桂林': 'guilin lijiang river landscape',
            '三亚': 'sanya tianya haijiao beach',
            '拉萨': 'lhasa potala palace'
          };
          
          const englishQuery = cityNameMap[keyword] || `${keyword.toLowerCase()} city landmark`;
          
          console.log(`🔎 使用英文搜索: "${englishQuery}"`);
          const englishResult = await this.searchPexels(englishQuery);
          
          if (englishResult) {
            console.log(`✅ 英文搜索成功`);
            return englishResult;
          }
        }
        
      } catch (error) {
        console.log(`⚠️ Pexels搜索失败: ${error.message}，使用备用方案`);
      }
    }
    
    // 如果是酒店类型，使用预设图片
    if (type === 'hotel') {
      const randomIndex = Math.floor(Math.random() * this.hotelImages.length);
      const imageUrl = this.hotelImages[randomIndex];
      console.log(`✅ 使用预设酒店图片`);
      return imageUrl;
    }
    
    // 检查是否有预设的城市图片
    const cityImage = this.getCityImage(keyword);
    if (cityImage) {
      console.log(`✅ 使用预设城市图片`);
      return cityImage;
    }
    
    // 返回通用城市图片
    console.log(`⚠️ 使用通用城市图片`);
    return 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&w=800';
  }
  
  // Pexels API 搜索（带重试机制）
  async searchPexels(keyword, retries = 2) {
    // 验证 API Key 格式
    if (!this.pexelsApiKey || this.pexelsApiKey === 'YOUR_PEXELS_API_KEY_HERE') {
      console.log(`⚠️ Pexels API Key 未配置或无效`);
      return null;
    }
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Pexels搜索尝试 ${i + 1}/${retries}: "${keyword}"`);
        const startTime = Date.now();
        
        // 检测是否为中文查询
        const isChinese = /[\u4e00-\u9fa5]/.test(keyword);
        
        const response = await axios.get('https://api.pexels.com/v1/search', {
          params: {
            query: keyword,
            per_page: 1,
            orientation: 'landscape',
            locale: isChinese ? 'zh-CN' : 'en-US' // 根据关键词语言自动选择
          },
          headers: {
            'Authorization': this.pexelsApiKey // 文档要求直接传递 API Key
          },
          httpsAgent: this.httpsAgent, // 使用持久连接
          timeout: 12000, // 首次请求需要更长时间（DNS + TCP + TLS + HTTP）
          validateStatus: (status) => status === 200 // 只接受200状态
        });
        
        const duration = Date.now() - startTime;
        console.log(`📊 Pexels响应成功: ${duration}ms, 结果数: ${response.data.total_results}`);
        
        if (response.data.photos && response.data.photos.length > 0) {
          // 使用 large 尺寸（文档建议）
          const imageUrl = response.data.photos[0].src.large || response.data.photos[0].src.original;
          console.log(`✅ 找到图片: ${imageUrl.substring(0, 60)}...`);
          return imageUrl;
        }
        
        console.log(`⚠️ 搜索 "${keyword}" 无结果`);
        // 如果没有结果，不重试
        return null;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error.response?.status 
          ? `HTTP ${error.response.status}: ${error.response.statusText}` 
          : error.message;
        console.log(`❌ 第 ${i + 1} 次尝试失败 (${duration}ms): ${errorMsg}`);
        
        // 如果是认证错误，立即返回
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log(`🚫 API Key 认证失败，请检查 PEXELS_API_KEY 是否正确`);
          return null;
        }
        
        // 如果是最后一次尝试，返回null而不是抛出错误
        if (i === retries - 1) {
          console.log(`🔴 所有重试失败，将使用预设图片`);
          return null;
        }
        
        // 等待后重试
        console.log(`⏳ 等待1秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  // 获取城市图片
  getCityImage(keyword) {
    // 直接匹配
    if (this.cityImageMap[keyword]) {
      return this.cityImageMap[keyword];
    }
    
    // 模糊匹配（包含城市名）
    for (const [city, imageUrl] of Object.entries(this.cityImageMap)) {
      if (keyword.includes(city) || city.includes(keyword.split(' ')[0])) {
        return imageUrl;
      }
    }
    
    return null;
  }
}

// 智谱清言 API 服务
class ZhipuAIService {
  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY;
    this.apiUrl = process.env.ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  async generateTrip(params) {
    const { destination, date, days, type } = params;

    const typeNames = {
      family: '家庭旅行',
      couple: '情侣旅行',
      solo: '独自旅行',
      adventure: '冒险探索'
    };

    const prompt = `请为我规划一次${days}天的${destination}${typeNames[type] || '旅行'}，出发日期是${date}。

⚠️ 重要要求：
1. 必须生成完整的${days}天行程
2. 每天包含上午、中午、下午、傍晚的活动（每天至少4个活动）
3. 【关键】只返回纯JSON格式，不要添加任何其他文字
4. 图片字段暂时留空（填写 "PLACEHOLDER"），后端会自动替换为真实图片

JSON格式：
{
  "title": "行程标题",
  "summary": {
    "days": ${days},
    "destinations": 1,
    "travelers": 4
  },
  "destinations": [
    {
      "id": 1,
      "city": "${destination}",
      "country": "中国",
      "description": "城市简介",
      "landmark": "城市最著名地标名称（用于搜索图片，例如：天安门、东方明珠、西湖等）",
      "image": "PLACEHOLDER",
      "days": [
        {
          "date": "日期",
          "title": "当天主题",
          "activities": [
            {
              "time": "上午",
              "name": "活动名称",
              "description": "活动描述",
              "icon": "🏛️",
              "duration": "2小时"
            }
          ],
          "accommodation": "住宿名称"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "酒店名称",
      "city": "${destination}",
      "image": "PLACEHOLDER",
      "description": "酒店描述"
    }
  ]
}`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'glm-4',
          messages: [
            {
              role: 'system',
              content: '你是专业的旅行规划助手。只返回有效的JSON格式数据，不要添加任何其他文字。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('🤖 智谱AI原始响应:', content.substring(0, 200));
      
      return this.parseResponse(content);
    } catch (error) {
      console.error('❌ 智谱AI调用失败:', error.response?.data || error.message);
      throw error;
    }
  }

  parseResponse(content) {
    try {
      // 提取 JSON
      let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      }
      
      let jsonStr = jsonMatch ? jsonMatch[1] : content;
      
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
      
      return JSON.parse(jsonStr.trim());
    } catch (error) {
      console.error('❌ JSON解析失败:', error);
      throw new Error('无法解析AI响应');
    }
  }
}

// 初始化服务
const imageSearchService = new ImageSearchService();
const zhipuService = new ZhipuAIService();

// 辅助函数：提取酒店品牌名
function extractHotelBrand(hotelName) {
  // 常见酒店品牌列表
  const brands = [
    '希尔顿', '万豪', '喜来登', '凯悦', '香格里拉', '洲际', '皇冠假日',
    '威斯汀', '万丽', '索菲特', '铂尔曼', '诺富特', '美居',
    '丽思卡尔顿', '瑞吉', '宝格丽', '安缦', '悦榕庄', '文华东方',
    '四季', '半岛', '康莱德', '华尔道夫', '柏悦', '艾迪逊',
    '凯宾斯基', '费尔蒙', '朗廷', '丽晶', '璞丽', 'JW万豪',
    'Hilton', 'Marriott', 'Sheraton', 'Hyatt', 'InterContinental',
    'Westin', 'Sofitel', 'Ritz-Carlton', 'Four Seasons'
  ];
  
  // 查找匹配的品牌
  for (const brand of brands) {
    if (hotelName.includes(brand)) {
      return `${brand} 酒店`;
    }
  }
  
  // 如果没有找到品牌，返回 null（使用城市名降级）
  return null;
}

// API 路由：生成旅行规划
app.post('/api/generate-trip', async (req, res) => {
  try {
    const { destination, date, days, type } = req.body;
    
    console.log(`\n📝 收到请求: ${destination} ${days}天 ${type}`);
    
    // 1. 调用智谱AI生成行程
    console.log('🤖 正在调用智谱AI...');
    const tripData = await zhipuService.generateTrip({ destination, date, days, type });
    
    // 2. 替换图片链接
    console.log('🖼️  正在获取真实图片...');
    
    // 替换城市图片（优先使用LLM返回的地标名称）
    if (tripData.destinations && tripData.destinations[0]) {
      const destination = tripData.destinations[0];
      const cityName = destination.city;
      const landmark = destination.landmark; // LLM返回的地标名称
      
      // 地标中英文映射（用于Pexels英文搜索）
      const landmarkEnglishMap = {
        '天安门': 'tiananmen square',
        '故宫': 'forbidden city beijing',
        '长城': 'great wall china',
        '天坛': 'temple of heaven',
        '颐和园': 'summer palace beijing',
        '东方明珠': 'oriental pearl tower',
        '外滩': 'the bund shanghai',
        '西湖': 'west lake hangzhou',
        '雷峰塔': 'leifeng pagoda',
        '小蛮腰': 'canton tower guangzhou',
        '广州塔': 'canton tower night',
        '天津之眼': 'tianjin eye ferris wheel',
        '索菲亚教堂': 'saint sophia cathedral harbin',
        '中央大街': 'zhongyang street harbin',
        '太阳岛': 'sun island harbin',
        '冰雪大世界': 'harbin ice festival',
        '大明湖': 'daming lake jinan',
        '趵突泉': 'baotu spring jinan',
        '千佛山': 'qianfo mountain',
        '黄鹤楼': 'yellow crane tower',
        '钟楼': 'bell tower xian',
        '大雁塔': 'giant wild goose pagoda',
        '兵马俑': 'terracotta warriors',
        '洪崖洞': 'hongya cave chongqing',
        '朝天门': 'chaotianmen chongqing',
        '鼓浪屿': 'gulangyu island',
        '布达拉宫': 'potala palace lhasa'
      };
      
      let searchKeyword;
      if (landmark) {
        // 优先使用英文地标名
        const englishLandmark = landmarkEnglishMap[landmark];
        if (englishLandmark) {
          searchKeyword = englishLandmark;
          console.log(`🔍 使用英文地标: ${landmark} → ${englishLandmark}`);
        } else {
          // 降级为中文
          searchKeyword = `${cityName} ${landmark}`;
          console.log(`🔍 使用中文搜索: ${searchKeyword}`);
        }
      } else {
        searchKeyword = cityName;
      }
      
      destination.image = await imageSearchService.searchImage(searchKeyword, 'city');
      console.log(`✅ 城市图片: ${cityName}`);
    }
    
    // 替换酒店图片（使用智能搜索策略）
    if (tripData.hotels) {
      for (let i = 0; i < tripData.hotels.length; i++) {
        const hotel = tripData.hotels[i];
        // 提取酒店品牌名或使用城市名
        // 例如："天津瑞吉金融街酒店" → "瑞吉 酒店" 或 "天津 豪华酒店"
        const hotelBrand = extractHotelBrand(hotel.name);
        const searchQuery = hotelBrand || `${hotel.city} 豪华酒店`;
        
        hotel.image = await imageSearchService.searchImage(searchQuery, 'hotel');
        console.log(`✅ 酒店图片 ${i + 1}: ${hotel.name} (搜索: ${searchQuery})`);
      }
    }
    
    console.log('✅ 行程生成成功！\n');
    res.json(tripData);
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
    res.status(500).json({ 
      error: '生成旅行规划失败', 
      message: error.message 
    });
  }
});

// PDF 生成路由
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const tripData = req.body;
    console.log(`\n📄 开始生成PDF: ${tripData.title}`);
    console.log(`目的地数量: ${tripData.destinations?.length || 0}`);
    console.log(`酒店数量: ${tripData.hotels?.length || 0}`);
    
    // 生成PDF Buffer
    const pdfBuffer = await PDFService.generatePDF(tripData);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('生成的PDF文件为空');
    }
    
    // 设置响应头
    const filename = `${tripData.title || '旅行计划'}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // 返回PDF文件
    res.end(pdfBuffer, 'binary');
    console.log(`✅ PDF生成成功: ${filename} (${pdfBuffer.length} bytes)\n`);
    
    
    
  } catch (error) {
    console.error('❌ PDF生成失败:', error);
    res.status(500).json({ 
      error: 'PDF生成失败', 
      message: error.message 
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '旅行规划后端服务运行中',
    zhipuConfigured: !!process.env.ZHIPU_API_KEY,
    imageService: process.env.PEXELS_API_KEY ? 'Pexels API（已配置）' : '预设图片库（高质量）'
  });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`\n🚀 旅行规划后端服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🤖 智谱AI: ${process.env.ZHIPU_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`🖼️  图片服务: ${process.env.PEXELS_API_KEY ? '✅ Pexels API' : '✅ 预设图片库（推荐）'}`);
  
  // 预热 Pexels API 连接（避免首次请求超时）
  if (process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY_HERE') {
    console.log(`\n🔥 正在预热 Pexels API 连接...`);
    try {
      const testResponse = await axios.get('https://api.pexels.com/v1/search', {
        params: { query: 'test', per_page: 1 },
        headers: { 'Authorization': process.env.PEXELS_API_KEY },
        httpsAgent: httpsAgent,
        timeout: 15000
      });
      console.log(`✅ Pexels 连接预热成功！后续请求将更快。`);
      console.log(`   剩余配额: ${testResponse.headers['x-ratelimit-remaining']}/${testResponse.headers['x-ratelimit-limit']}`);
    } catch (error) {
      console.log(`⚠️ Pexels 预热失败: ${error.message}`);
      console.log(`   不影响使用，将在首次请求时建立连接`);
    }
  }
  
  console.log(`\n等待前端请求...\n`);
});
