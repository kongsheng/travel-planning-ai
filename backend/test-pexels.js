const axios = require('axios');
require('dotenv').config();

// Pexels API 测试脚本
async function testPexelsAPI() {
  const apiKey = process.env.PEXELS_API_KEY;
  
  console.log('======================================');
  console.log('📡 Pexels API 测试');
  console.log('======================================\n');
  
  // 检查 API Key
  console.log('1️⃣ API Key 检查:');
  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.log('❌ API Key 未配置或无效');
    console.log(`   当前值: ${apiKey}`);
    return;
  }
  console.log(`✅ API Key 已配置`);
  console.log(`   前6位: ${apiKey.substring(0, 6)}...`);
  console.log(`   长度: ${apiKey.length} 字符\n`);
  
  // 测试搜索请求
  const testQueries = [
    '北京 地标',           // 中文城市搜索
    '上海 酒店',           // 中文酒店搜索
    'beijing city',        // 英文城市搜索
    'hotel luxury room'    // 英文酒店搜索
  ];
  
  for (const query of testQueries) {
    console.log(`2️⃣ 测试搜索: "${query}"`);
    try {
      const startTime = Date.now();
      
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: query,
          per_page: 1,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': apiKey
        },
        timeout: 10000
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ 请求成功 (${duration}ms)`);
      console.log(`   状态码: ${response.status}`);
      console.log(`   总结果数: ${response.data.total_results}`);
      
      // 检查响应头（速率限制信息）
      console.log(`   速率限制:`);
      console.log(`     - 月度限额: ${response.headers['x-ratelimit-limit']}`);
      console.log(`     - 剩余请求: ${response.headers['x-ratelimit-remaining']}`);
      console.log(`     - 重置时间: ${new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000).toLocaleString('zh-CN')}`);
      
      if (response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        console.log(`   图片信息:`);
        console.log(`     - ID: ${photo.id}`);
        console.log(`     - 摄影师: ${photo.photographer}`);
        console.log(`     - 尺寸: ${photo.width}x${photo.height}`);
        console.log(`     - URL: ${photo.src.large.substring(0, 60)}...`);
      } else {
        console.log(`   ⚠️ 没有找到图片`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ 请求失败`);
      if (error.response) {
        console.log(`   HTTP状态: ${error.response.status}`);
        console.log(`   错误信息: ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`   详细信息: ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        console.log(`   错误类型: 请求超时`);
        console.log(`   建议: 检查网络连接或增加 timeout 值`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`   错误类型: 无法解析域名`);
        console.log(`   建议: 检查网络连接和DNS设置`);
      } else {
        console.log(`   错误信息: ${error.message}`);
        console.log(`   错误代码: ${error.code}`);
      }
      console.log('');
    }
  }
  
  console.log('======================================');
  console.log('✅ 测试完成');
  console.log('======================================');
}

// 运行测试
testPexelsAPI().catch(error => {
  console.error('测试脚本出错:', error);
});
