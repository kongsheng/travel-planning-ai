// PDF 生成服务 - 使用 html-pdf-node 将 HTML 转换为 PDF
const htmlToPdf = require('html-pdf-node');

class PDFService {
  // 生成PDF文件(Buffer格式)
  static async generatePDF(tripData) {
    try {
      console.log('🚀 开始生成 PDF...');
      
      // 生成 HTML 内容
      const html = this.generateHTML(tripData);
      console.log('✅ HTML 内容生成完成, 长度:', html.length);
      
      // 配置 PDF 选项
      const options = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      };
      
      const file = { content: html };
      
      // 生成 PDF Buffer
      const pdfBuffer = await htmlToPdf.generatePdf(file, options);
      console.log('✅ PDF 生成成功, 大小:', pdfBuffer.length, 'bytes');
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('❌ PDF 生成失败:', error);
      throw error;
    }
  }

  // 生成 HTML 格式的行程计划
  static generateHTML(tripData) {
    const { title, summary, destinations, hotels } = tripData;

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    @page {
      size: A4;
      margin: 0;
    }
    html {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background: #ffffff;
      padding: 15px 20px;
      margin: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 12px;
      border-bottom: 3px solid #667eea;
    }
    .header h1 {
      font-size: 24px;
      color: #667eea;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .meta {
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .meta span {
      display: inline-block;
      margin: 0 12px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      color: #667eea;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e0e0e0;
      font-weight: bold;
    }
    .destination {
      margin-bottom: 18px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 5px;
    }
    .destination h3 {
      font-size: 17px;
      color: #333;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .destination p {
      color: #666;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.7;
    }
    .day {
      margin-bottom: 15px;
      background: #ffffff;
      padding: 12px 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .day-header {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    .day-date {
      color: #667eea;
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: bold;
    }
    .activity {
      margin: 8px 0 8px 15px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .activity:last-child {
      border-bottom: none;
    }
    .activity-time {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      margin-right: 8px;
      font-weight: bold;
    }
    .activity-name {
      font-weight: bold;
      color: #333;
      font-size: 13px;
    }
    .activity-desc {
      color: #666;
      font-size: 12px;
      margin-top: 5px;
      margin-left: 18px;
      line-height: 1.6;
    }
    .activity-duration {
      color: #999;
      font-size: 11px;
      margin-left: 18px;
      margin-top: 3px;
    }
    .accommodation {
      margin-top: 10px;
      padding: 8px 12px;
      background: #fff3cd;
      border-radius: 4px;
      font-size: 13px;
      border-left: 3px solid #ffc107;
    }
    .hotels {
      margin-top: 10px;
    }
    .hotel {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      border: 1px solid #dee2e6;
      display: inline-block;
      width: 48%;
      vertical-align: top;
      margin-right: 2%;
    }
    .hotel:nth-child(2n) {
      margin-right: 0;
    }
    .hotel h4 {
      color: #333;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: bold;
    }
    .hotel-city {
      color: #667eea;
      font-size: 13px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .hotel-desc {
      color: #666;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      <span>📅 ${summary.days} 天</span>
      <span>📍 ${summary.destinations} 个目的地</span>
      <span>👥 ${summary.travelers} 人</span>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">📍 行程详情</h2>
    ${destinations.map((dest) => `
      <div class="destination">
        <h3>${dest.city}, ${dest.country}</h3>
        <p>${dest.description}</p>
        
        ${dest.days.map((day) => `
          <div class="day">
            <div class="day-date">${day.date}</div>
            <div class="day-header">${day.title}</div>
            ${day.activities.map(activity => `
              <div class="activity">
                <div>
                  <span class="activity-time">${activity.time}</span>
                  <span class="activity-name">${activity.name}</span>
                </div>
                <div class="activity-desc">${activity.description}</div>
                <div class="activity-duration">⏱️ ${activity.duration}</div>
              </div>
            `).join('')}
            <div class="accommodation">🏨 住宿：${day.accommodation}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">🏨 精选住宿</h2>
    <div class="hotels">
      ${hotels.map(hotel => `
        <div class="hotel">
          <h4>${hotel.name}</h4>
          <div class="hotel-city">📍 ${hotel.city}</div>
          <div class="hotel-desc">${hotel.description}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="footer">
    <p>此旅行计划由 AI 智能生成 | 生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>
    `;

    return html;
  }
}

module.exports = PDFService;

