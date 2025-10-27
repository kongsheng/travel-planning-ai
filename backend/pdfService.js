// PDF 生成服务 - 使用 PDFKit 生成真正的PDF文件(无需浏览器)
const PDFDocument = require('pdfkit');

class PDFService {
  // 生成PDF文件(Buffer格式)
  static async generatePDF(tripData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('开始生成 PDF...');
        
        // 创建PDF文档
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // 收集PDF数据到Buffer
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('✅ PDF生成成功,大小:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        const { title, summary, destinations, hotels } = tripData;

        // 注册中文字体(使用系统自带字体)
        try {
          // Linux 系统字体路径
          doc.registerFont('Chinese', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc');
          doc.font('Chinese');
        } catch (e) {
          console.log('⚠️ 中文字体加载失败,使用默认字体');
          doc.font('Helvetica');
        }

        // 1. 标题部分
        doc.fontSize(24)
           .fillColor('#667eea')
           .text(title, { align: 'center' });
        
        doc.moveDown(0.5);
        
        // 2. 摘要信息
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`${summary.days} 天  |  ${summary.destinations} 个目的地  |  ${summary.travelers} 人`, { 
             align: 'center' 
           });
        
        doc.moveDown();
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .strokeColor('#667eea')
           .lineWidth(2)
           .stroke();
        
        doc.moveDown(1.5);

        // 3. 行程详情标题
        doc.fontSize(16)
           .fillColor('#667eea')
           .text('行程详情');
        
        doc.moveDown(0.5);

        // 遍历目的地
        destinations.forEach((dest) => {
          // 城市信息
          doc.fontSize(14)
             .fillColor('#333333')
             .text(`${dest.city}, ${dest.country}`, { underline: true });
          
          doc.moveDown(0.3);
          
          doc.fontSize(11)
             .fillColor('#666666')
             .text(dest.description, { align: 'justify' });
          
          doc.moveDown(0.8);

          // 每日行程
          dest.days.forEach((day) => {
            // 检查是否需要换页
            if (doc.y > 700) {
              doc.addPage();
            }

            // 日期和标题
            doc.fontSize(12)
               .fillColor('#667eea')
               .text(day.date);
            
            doc.fontSize(11)
               .fillColor('#333333')
               .text(day.title);
            
            doc.moveDown(0.3);

            // 活动列表
            day.activities.forEach((activity) => {
              const activityText = `${activity.time} - ${activity.name}`;
              const activityDesc = `   ${activity.description} (${activity.duration})`;
              
              doc.fontSize(10)
                 .fillColor('#333333')
                 .text(activityText);
              
              doc.fontSize(9)
                 .fillColor('#666666')
                 .text(activityDesc, { indent: 15 });
              
              doc.moveDown(0.2);
            });

            // 住宿信息
            doc.fontSize(10)
               .fillColor('#FF9800')
               .text(`住宿: ${day.accommodation}`);
            
            doc.moveDown(0.8);
          });

          doc.moveDown(0.5);
        });

        // 4. 酒店推荐
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.fontSize(16)
           .fillColor('#667eea')
           .text('精选住宿');
        
        doc.moveDown(0.5);

        hotels.forEach((hotel) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(12)
             .fillColor('#333333')
             .text(hotel.name);
          
          doc.fontSize(10)
             .fillColor('#667eea')
             .text(hotel.city);
          
          doc.fontSize(9)
             .fillColor('#666666')
             .text(hotel.description, { align: 'justify' });
          
          doc.moveDown(0.8);
        });

        // 5. 页脚
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          
          doc.fontSize(8)
             .fillColor('#999999')
             .text(
               `此旅行计划由 AI 智能生成 | 生成时间: ${new Date().toLocaleString('zh-CN')}`,
               50,
               doc.page.height - 40,
               { align: 'center', width: doc.page.width - 100 }
             );
        }

        // 完成PDF生成
        doc.end();
        
      } catch (error) {
        console.error('❌ PDF生成失败:', error);
        reject(error);
      }
    });
  }
}

module.exports = PDFService;
