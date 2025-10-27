# 🎨 获取 Pexels API Key 指南

## 1. 注册 Pexels 账号

访问：**https://www.pexels.com/**

- 点击右上角 "Join"
- 使用邮箱注册（或 Google/Facebook 登录）
- 验证邮箱

## 2. 申请 API Key

### 步骤：

1. 访问 API 页面：**https://www.pexels.com/api/**

2. 点击 **"Get Started"** 或 **"Sign up for free"**

3. 填写申请表单：
   - **First Name**: 你的名字
   - **Last Name**: 你的姓氏
   - **Email**: 你的邮箱
   - **How will you use the Pexels API?**: 
     ```
     Building a travel planning application that needs 
     high-quality destination and hotel images.
     ```
   - 同意服务条款

4. 提交后，**立即获得 API Key**

## 3. 配置到项目

复制 API Key，然后编辑 `backend/.env`：

```env
PEXELS_API_KEY=你的API-Key
```

## 4. 重启后端服务

```bash
cd backend
npm start
```

## ✅ API 限制

- **免费计划**：
  - 每小时 200 次请求
  - 每月无限制
  - 高质量图片
  - 完全免费

- **对于旅行规划项目**：
  - 每次生成行程约使用 5-10 次请求
  - 每小时可生成 20-40 次行程
  - 完全够用！

## 🎯 搜索关键词

配置后，系统会自动搜索：
- **城市图片**: `"{城市名} landmark city"` 
  - 例如：`"Beijing landmark city"`
  - 例如：`"Shanghai landmark city"`
  
- **酒店图片**: `"luxury hotel {城市名}"`
  - 例如：`"luxury hotel Beijing"`

## 📝 示例效果

输入城市 → Pexels 搜索 → 返回真实地标图片

- 北京 → 故宫、长城等真实照片
- 巴黎 → 埃菲尔铁塔真实照片
- 东京 → 东京塔、富士山真实照片
- **任意城市** → 都能找到相关图片！

## 🚀 立即测试

配置完成后，访问：
```
http://localhost:3001/api/health
```

应该显示：
```json
{
  "status": "ok",
  "imageService": "Pexels API（已配置）"
}
```

现在可以搜索任意城市的真实图片了！🎉
