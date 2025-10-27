const PDFService = require('./pdfService');

// 测试数据
const testData = {
  title: '7天天津家庭之旅',
  summary: {
    days: 7,
    destinations: 1,
    travelers: 4
  },
  destinations: [
    {
      city: '天津',
      country: '中国',
      description: '中国北方的重要港口城市',
      days: [
        {
          date: '2025-10-28',
          title: '第一天：海河风光',
          activities: [
            {
              time: '上午',
              name: '海河游船',
              description: '乘坐游船欣赏海河美景',
              duration: '2小时'
            }
          ],
          accommodation: '天津希尔顿酒店'
        }
      ]
    }
  ],
  hotels: [
    {
      name: '天津希尔顿酒店',
      city: '天津',
      description: '豪华五星级酒店'
    }
  ]
};

console.log('开始测试PDF生成...\n');

PDFService.generatePDF(testData)
  .then(buffer => {
    console.log('✅ PDF生成成功!');
    console.log('Buffer大小:', buffer.length, 'bytes');
    
    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync('test-output.pdf', buffer);
    console.log('✅ PDF已保存到 test-output.pdf');
  })
  .catch(error => {
    console.error('❌ PDF生成失败:', error);
    console.error(error.stack);
  });
