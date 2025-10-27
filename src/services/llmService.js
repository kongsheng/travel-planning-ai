// API 配置和 LLM 调用服务

const API_CONFIG = {
  // 后端API地址：优先使用环境变量，开发环境默认本地
  endpoint: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api/generate-trip`
    : 'http://localhost:3001/api/generate-trip',
};

/**
 * 调用 LLM 生成旅行规划
 * @param {Object} params - 旅行参数
 * @param {string} params.destination - 目的地
 * @param {string} params.date - 出发日期
 * @param {number} params.days - 天数
 * @param {string} params.type - 旅行类型
 * @returns {Promise<Object>} 生成的旅行规划数据
 */
export async function generateTripPlan(params) {
  const { destination, date, days, type } = params;

  try {
    // 调用本地 Node.js 后端服务
    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        date,
        days,
        type
      }),
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status}`);
    }

    const tripData = await response.json();
    
    console.log('✅ 从后端获取到旅行数据:', tripData);
    
    return tripData;
  } catch (error) {
    console.error('LLM 调用错误:', error);
    throw error;
  }
}

/**
 * 构建提示词
 */
function buildPrompt(destination, date, days, type) {
  const typeNames = {
    family: '家庭旅行',
    couple: '情侣旅行',
    solo: '独自旅行',
    adventure: '冒险探索'
  };

  return `请为我规划一次${days}天的${destination}${typeNames[type] || '旅行'}，出发日期是${date}。

⚠️ 重要：必须生成完整的${days}天行程，不能少于${days}天！

⚠️ 【关键】请只返回纯JSON格式，不要添加任何其他文字、解释或markdown标记！

⚠️ 【图片要求】根据城市使用真实的地标图片URL：
- 使用高质量的图片URL，确保展示真实地标和酒店
- 北京地标图片：
  * 故宫: https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800
  * 长城: https://images.pexels.com/photos/2893685/pexels-photo-2893685.jpeg?auto=compress&w=800
  * 天坛: https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&w=800
- 上海地标：
  * 外滩: https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&w=800
  * 东方明珠: https://images.pexels.com/photos/2412611/pexels-photo-2412611.jpeg?auto=compress&w=800
- 酒店图片使用：
  * https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800
  * https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800
  * https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&w=800
- 如果是其他城市，使用通用城市风景：
  * https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&w=800

请按以下JSON格式返回（直接返回JSON，不要用代码块包裹）:

{
  "title": "行程标题",
  "summary": {
    "days": ${days},
    "destinations": 目的地数量,
    "travelers": 旅行人数
  },
  "destinations": [
    {
      "id": 1,
      "city": "城市名",
      "country": "国家",
      "description": "城市简介",
      "image": "https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800",
      "days": [
        {
          "date": "日期（从${date}开始计算）",
          "title": "当天主题",
          "activities": [
            {
              "time": "时间段（上午/中午/下午/傍晚）",
              "name": "活动名称",
              "description": "活动描述",
              "icon": "emoji图标",
              "duration": "时长"
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
      "city": "城市",
      "image": "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800",
      "description": "酒店描述"
    }
  ]
}

⚠️ 关键要求：
1. 【必须】destinations[0].days 数组必须包含完整的${days}个元素（第1天到第${days}天）
2. 【必须】每天包含上午、中午、下午、傍晚的活动（每天至少4个活动）
3. 活动安排合理，考虑${typeNames[type] || '旅行'}的特点
4. 推荐适合的住宿（每天都要有住宿安排）
5. 【图片URL】根据城市选择对应的地标图片：
   - 如果是北京：使用 https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800 （故宫）
   - 如果是上海：使用 https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&w=800 （外滩）
   - 如果是其他城市：使用 https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&w=800
   - 酒店图片依次使用：
     * https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800
     * https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800
     * https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&w=800
6. 【重要】每个活动的icon字段必须使用单个emoji表情符号（如：🏛️ 🍜 🎭 🌸）
7. 返回的内容必须是有效的JSON格式，不要有任何其他文字

示例：如果是7天行程，days数组必须有7个元素（day1, day2, day3...day7）`;
}

/**
 * 解析 LLM 响应
 */
function parseResponse(content) {
  try {
    console.log('=== LLM 原始响应 ===');
    console.log(content);
    console.log('==================');

    // 方法1: 尝试提取 JSON 代码块
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    }
    
    let jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    // 方法2: 尝试找到第一个 { 和最后一个 }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    // 清理可能的控制字符和多余空白
    jsonStr = jsonStr.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    console.log('=== 提取的 JSON 字符串 ===');
    console.log(jsonStr.substring(0, 500)); // 打印前500字符
    console.log('========================');
    
    const parsed = JSON.parse(jsonStr);
    
    // 验证必需字段
    if (!parsed.title || !parsed.destinations || !Array.isArray(parsed.destinations)) {
      console.error('❌ JSON 格式不完整，缺少必需字段');
      return getDefaultTripData();
    }
    
    console.log('✅ JSON 解析成功');
    return parsed;
  } catch (error) {
    console.error('❌ 解析响应失败:', error);
    console.error('错误详情:', error.message);
    // 返回默认数据
    return getDefaultTripData();
  }
}

/**
 * 获取默认旅行数据（作为降级方案）
 */
function getDefaultTripData() {
  return {
    title: '精彩旅程规划',
    summary: {
      days: 5,
      destinations: 2,
      travelers: 2
    },
    destinations: [
      {
        id: 1,
        city: '目的地',
        country: '国家',
        description: '这是一个美丽的城市，值得探索。',
        image: 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&w=800',
        days: [
          {
            date: '第1天',
            title: '抵达与探索',
            activities: [
              {
                time: '上午',
                name: '抵达酒店',
                description: '办理入住，稍作休息',
                icon: '🏨',
                duration: '2小时'
              },
              {
                time: '下午',
                name: '城市漫步',
                description: '探索当地街区和文化',
                icon: '🚶',
                duration: '3小时'
              }
            ],
            accommodation: '市中心酒店'
          }
        ]
      }
    ],
    hotels: [
      {
        name: '舒适酒店',
        city: '目的地',
        image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800',
        description: '位置便利，设施完善'
      }
    ]
  };
}

export default {
  generateTripPlan,
};
