#!/bin/bash

# 🚀 腾讯云服务器一键部署脚本
# 使用方法：
# 1. 登录服务器：ssh ubuntu@你的服务器IP
# 2. 复制这个脚本内容，保存为 deploy.sh
# 3. 运行：bash deploy.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 开始部署旅游规划AI项目"
echo "=========================================="

# 1. 更新系统
echo ""
echo "📦 第1步：更新系统包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 18
echo ""
echo "📦 第2步：安装 Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node.js 安装成功：$(node -v)"
else
    echo "✅ Node.js 已安装：$(node -v)"
fi

# 3. 安装 PM2
echo ""
echo "📦 第3步：安装 PM2 进程管理器..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 安装成功"
else
    echo "✅ PM2 已安装"
fi

# 4. 安装 Nginx
echo ""
echo "📦 第4步：安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo "✅ Nginx 安装成功"
else
    echo "✅ Nginx 已安装"
fi

# 5. 安装 Git（如果没有）
echo ""
echo "📦 第5步：检查 Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo "✅ Git 安装成功"
else
    echo "✅ Git 已安装"
fi

# 6. 克隆项目（或更新）
echo ""
echo "📦 第6步：获取项目代码..."
cd ~
PROJECT_DIR="travel-planning-ai"

if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  项目已存在，正在更新..."
    cd $PROJECT_DIR
    git pull
else
    echo "📥 正在克隆项目..."
    echo "⚠️  请先在 GitHub 创建仓库并推送代码！"
    echo "然后修改下面的 GitHub 地址："
    # 替换成你的 GitHub 仓库地址
    git clone https://github.com/你的用户名/travel-planning-ai.git
    cd $PROJECT_DIR
fi

# 7. 配置后端环境变量
echo ""
echo "📦 第7步：配置后端环境变量..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  创建 .env 文件..."
    cat > .env << 'EOF'
# 智谱清言 API
ZHIPU_API_KEY=你的智谱API密钥
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# Pexels 图片 API（可选）
PEXELS_API_KEY=

# 服务器配置
PORT=3001
NODE_ENV=production
EOF
    echo "❗ 请编辑 ~/travel-planning-ai/backend/.env 文件，填入你的 API Key！"
    echo "   执行命令：nano ~/travel-planning-ai/backend/.env"
    read -p "按 Enter 继续..."
else
    echo "✅ .env 文件已存在"
fi

# 8. 安装后端依赖
echo ""
echo "📦 第8步：安装后端依赖..."
npm install --production

# 9. 启动后端服务
echo ""
echo "📦 第9步：启动后端服务..."
pm2 stop travel-backend 2>/dev/null || true
pm2 delete travel-backend 2>/dev/null || true
pm2 start server.js --name travel-backend
pm2 save
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu
echo "✅ 后端服务已启动"

# 10. 构建前端
echo ""
echo "📦 第10步：构建前端..."
cd ..

# 创建前端环境变量
cat > .env.production << 'EOF'
# 后端地址（使用本地，因为前后端在同一服务器）
VITE_BACKEND_URL=http://localhost:3001
EOF

npm install
npm run build

# 11. 部署前端到 Nginx
echo ""
echo "📦 第11步：部署前端到 Nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
echo "✅ 前端文件已复制到 Nginx"

# 12. 配置 Nginx
echo ""
echo "📦 第12步：配置 Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 压缩优化
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# 测试 Nginx 配置
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ Nginx 配置成功并已重启"
else
    echo "❌ Nginx 配置有误，请检查"
    exit 1
fi

# 13. 配置防火墙
echo ""
echo "📦 第13步：配置防火墙..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable
echo "✅ 防火墙配置完成"

# 14. 显示运行状态
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📊 服务状态："
pm2 status
echo ""
echo "🌐 访问地址："
echo "   http://$(curl -s ifconfig.me)"
echo ""
echo "📝 常用命令："
echo "   查看后端日志：pm2 logs travel-backend"
echo "   重启后端：pm2 restart travel-backend"
echo "   查看 Nginx 状态：sudo systemctl status nginx"
echo "   重启 Nginx：sudo systemctl restart nginx"
echo ""
echo "⚠️  重要提醒："
echo "   1. 记得修改 backend/.env 文件中的 API Key"
echo "   2. 在腾讯云控制台开放 80 端口（防火墙规则）"
echo "   3. 建议配置域名和 HTTPS 证书"
echo ""
echo "🎉 开始使用你的旅游规划AI吧！"
echo "=========================================="
