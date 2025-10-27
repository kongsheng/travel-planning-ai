// PDF 生成服务 - 使用 puppeteer 生成真正的PDF文件
const puppeteer = require('puppeteer');

class PDFService {
  // 生成PDF文件（Buffer格式）
  static async generatePDF(tripData) {
    let browser = null;
    try {
      console.log('启动puppeteer浏览器...');
      
      // 生成HTML内容
      const html = this.generateHTML(tripData);
      console.log('HTML内容生成完成,长度:', html.length);
      
      // 启动浏览器
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      console.log('浏览器页面已创建');
      
      // 设置HTML内容
      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 30000
      });
      console.log('HTML内容已加载到页面');
      
      // 生成PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        },
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        omitBackground: false
      });
      
      console.log('PDF生成完成,大小:', pdfBuffer.length, 'bytes');
      
      await browser.close();
      console.log('浏览器已关闭');
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDF生成过程出错:', error);
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('关闭浏览器失败:', closeError);
        }
      }
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
      font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background: #ffffff;
      padding: 10mm 12mm;
      margin: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .header h1 {
      font-size: 26px;
      color: #667eea;
      margin-bottom: 10px;
    }
    .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 14px;
      color: #666;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 18px;
      color: #667eea;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e0e0e0;
    }
    .destination {
      margin-bottom: 18px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
    }
    .destination h3 {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
    }
    .destination p {
      color: #666;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.6;
    }
    .day {
      margin-bottom: 12px;
      background: #fff;
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .day-header {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }
    .day-date {
      color: #667eea;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .activity {
      margin: 6px 0 6px 12px;
      padding: 5px 0;
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
    }
    .activity-name {
      font-weight: bold;
      color: #333;
      font-size: 13px;
    }
    .activity-desc {
      color: #666;
      font-size: 12px;
      margin-top: 3px;
      margin-left: 14px;
      line-height: 1.5;
    }
    .activity-duration {
      color: #999;
      font-size: 11px;
      margin-left: 14px;
    }
    .accommodation {
      margin-top: 8px;
      padding: 8px 10px;
      background: #fff3cd;
      border-radius: 4px;
      font-size: 13px;
    }
    .hotels {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    .hotel {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .hotel h4 {
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .hotel-city {
      color: #667eea;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .hotel-desc {
      color: #666;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
    @media print {
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      body {
        padding: 5mm !important;
      }
      .header {
        margin-bottom: 10px !important;
        padding-bottom: 8px !important;
      }
      .section {
        margin-bottom: 10px !important;
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
    ${destinations.map((dest, index) => `
      <div class="destination">
        <h3>${dest.city}, ${dest.country}</h3>
        <p>${dest.description}</p>
        
        ${dest.days.map((day, dayIndex) => `
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
