# 旅行规划后端服务

## 功能
- 调用智谱清言 API 生成旅行规划
- 调用百度图片搜索 API 获取真实地标图片
- 自动替换占位图片为真实图片

## 安装

```bash
cd backend
npm install
```

## 配置

编辑 `.env` 文件：

```env
# 智谱清言 API Key
ZHIPU_API_KEY=your-zhipu-api-key

# 百度 API（可选）
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key

# 服务器端口
PORT=3001
```

### 获取 API Key

1. **智谱清言 API**
   - 访问：https://open.bigmodel.cn/
   - 注册并创建 API Key
   - 新用户有免费额度

2. **百度 API**（可选，目前使用预设图片库）
   - 访问：https://ai.baidu.com/
   - 开通相关服务
   - 获取 API Key 和 Secret Key

## 启动服务

```bash
npm start
```

或使用开发模式（自动重启）：

```bash
npm run dev
```

服务将运行在 `http://localhost:3001`

## API 接口

### 生成旅行规划
- **POST** `/api/generate-trip`
- **Body**:
  ```json
  {
    "destination": "北京",
    "date": "2025-10-28",
    "days": 7,
    "type": "family"
  }
  ```

### 健康检查
- **GET** `/api/health`

## 流程说明

1. 前端发送旅行规划请求
2. 后端调用智谱清言 API 生成行程数据
3. 后端根据城市名称搜索百度图片
4. 后端替换占位图片为真实图片链接
5. 返回完整的行程数据给前端

## 图片映射

当前预设了以下城市的地标图片：
- 北京：故宫、长城、天坛
- 上海：外滩、东方明珠
- 酒店：豪华酒店图片

可以在 `server.js` 的 `getDefaultImage` 方法中添加更多城市。
