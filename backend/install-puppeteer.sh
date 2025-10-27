#!/bin/bash
# Puppeteer 完整安装脚本 - Ubuntu 20.04

echo "🚀 开始安装 Puppeteer 及 Chrome 依赖..."

# 1. 更新包管理器
echo "📦 更新 apt 包列表..."
sudo apt-get update

# 2. 安装 Chrome 运行所需的系统依赖
echo "🔧 安装 Chrome 系统依赖..."
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# 3. 安装中文字体(支持中文PDF)
echo "🀄 安装中文字体..."
sudo apt-get install -y \
    fonts-wqy-zenhei \
    fonts-wqy-microhei \
    ttf-wqy-microhei \
    ttf-wqy-zenhei

# 4. 进入项目目录
cd ~/travel-planning-ai/backend

# 5. 安装 npm 依赖(包括 puppeteer)
echo "📥 安装 npm 依赖..."
npm install

echo ""
echo "✅ Puppeteer 安装完成!"
echo ""
echo "🧪 测试 Puppeteer..."

# 6. 创建测试脚本
cat > test-puppeteer.js << 'EOF'
const puppeteer = require('puppeteer');

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('创建页面...');
  const page = await browser.newPage();
  
  console.log('设置HTML内容...');
  await page.setContent('<h1>测试PDF生成</h1><p>中文内容测试</p>');
  
  console.log('生成PDF...');
  const pdfBuffer = await page.pdf({ format: 'A4' });
  
  console.log('✅ PDF生成成功! 大小:', pdfBuffer.length, 'bytes');
  
  await browser.close();
  console.log('✅ Puppeteer 测试通过!');
})();
EOF

# 7. 运行测试
node test-puppeteer.js

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 安装成功! 现在可以重启后端服务了:"
  echo "   pm2 restart travel-backend"
  echo "   pm2 logs travel-backend"
else
  echo ""
  echo "❌ 测试失败,请检查错误信息"
fi
