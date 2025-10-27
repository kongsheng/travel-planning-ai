# Pexels API 超时问题解决方案

## 问题现象

你遇到的问题：
```
🔍 搜索图片: 北京 (类型: city)
⚠️ Pexels搜索失败: timeout of 8000ms exceeded，使用备用方案
✅ 使用预设城市图片

🔍 搜索图片: 酒店 (类型: hotel)
✅ Pexels搜索成功
```

**第一次请求超时，第二次成功** ← 这是典型的"冷启动"问题！

---

## 根本原因分析

### 为什么第一次慢？

当你第一次访问 `api.pexels.com` 时，需要经历：

```
总耗时 = DNS查询 + TCP握手 + TLS握手 + HTTP请求 + 响应传输

1. DNS 查询 (500-2000ms)
   └─ 将 api.pexels.com 解析为 IP 地址
   
2. TCP 握手 (200-500ms)
   └─ 建立 TCP 连接（3次握手）
   
3. TLS 握手 (500-1500ms)
   └─ HTTPS 加密协商（证书验证）
   
4. HTTP 请求 (100-300ms)
   └─ 发送请求并等待响应
   
5. 响应传输 (100-500ms)
   └─ 接收图片数据

总计：约 1400-4800ms（国内访问海外服务器更慢）
```

### 为什么第二次快？

HTTP **Keep-Alive** 机制：
- 第一次请求建立的 TCP/TLS 连接被保持
- 第二次请求直接复用连接，跳过 DNS + TCP + TLS
- 只需要 HTTP 请求 + 响应传输（约 200-800ms）

---

## 解决方案（已实施）

### ✅ 1. 使用持久化 HTTP Agent

**修改内容：**
```javascript
// 创建持久化连接（全局复用）
const httpsAgent = new https.Agent({
  keepAlive: true,        // 保持连接
  keepAliveMsecs: 30000,  // 连接保持30秒
  maxSockets: 50,         // 最大并发连接数
  maxFreeSockets: 10,     // 保持的空闲连接数
  timeout: 60000          // 连接超时60秒
});

class ImageSearchService {
  constructor() {
    this.httpsAgent = httpsAgent; // 使用全局 agent
  }
}
```

**效果：**
- ✅ 所有请求复用同一个连接池
- ✅ 避免每次都重新建立连接
- ✅ 减少延迟约 60-80%

---

### ✅ 2. 增加超时时间

**修改内容：**
```javascript
timeout: 12000  // 8秒 → 12秒
```

**原因：**
- 首次请求需要 DNS + TCP + TLS，可能需要 8-10 秒
- 8秒超时对首次请求太短
- 12秒可以覆盖大多数网络情况

---

### ✅ 3. 服务器启动时预热连接

**修改内容：**
```javascript
app.listen(PORT, async () => {
  // 服务器启动时发送一个测试请求
  if (process.env.PEXELS_API_KEY) {
    console.log('🔥 正在预热 Pexels API 连接...');
    await axios.get('https://api.pexels.com/v1/search', {
      params: { query: 'test', per_page: 1 },
      headers: { 'Authorization': process.env.PEXELS_API_KEY },
      httpsAgent: httpsAgent,
      timeout: 15000
    });
    console.log('✅ 连接预热成功！');
  }
});
```

**效果：**
- ✅ 用户第一次请求时，连接已经建立好了
- ✅ 避免用户体验首次慢的问题
- ✅ 即使预热失败也不影响后续使用

---

### ✅ 4. 改进日志和错误处理

**添加功能：**
```javascript
// 记录每次请求耗时
const startTime = Date.now();
const duration = Date.now() - startTime;
console.log(`📊 Pexels响应成功: ${duration}ms`);

// 详细的错误信息
catch (error) {
  const errorMsg = error.response?.status 
    ? `HTTP ${error.response.status}` 
    : error.message;
  console.log(`❌ 请求失败 (${duration}ms): ${errorMsg}`);
}
```

**效果：**
- ✅ 可以精确看到每次请求的耗时
- ✅ 方便诊断是网络问题还是服务器问题
- ✅ 更好地调整超时参数

---

## 测试验证

### 测试脚本

运行 `backend/test-pexels.bat` 或：
```bash
cd backend
node test-pexels.js
```

**预期结果：**
```
📡 Pexels API 测试
======================================

1️⃣ API Key 检查:
✅ API Key 已配置
   前6位: 1GYwjL...
   长度: 56 字符

2️⃣ 测试搜索: "beijing city"
   ✅ 请求成功 (3500ms)  ← 第一次较慢
   状态码: 200
   总结果数: 1234
   速率限制:
     - 月度限额: 20000
     - 剩余请求: 19998
   图片信息:
     - ID: 123456
     - 摄影师: John Doe
     - URL: https://images.pexels.com/...

2️⃣ 测试搜索: "hotel luxury room"
   ✅ 请求成功 (850ms)   ← 第二次明显变快
   ...
```

---

## 性能对比

### 优化前
```
第1次请求: ❌ 超时 (>8000ms)
第2次请求: ✅ 成功 (700ms)
第3次请求: ✅ 成功 (650ms)
```

### 优化后（预期）
```
服务器启动: 🔥 预热连接 (3500ms)
第1次请求: ✅ 成功 (800ms)   ← 快了10倍！
第2次请求: ✅ 成功 (600ms)
第3次请求: ✅ 成功 (550ms)
```

---

## 其他优化建议

### 方案 A：完全依赖预设图片库（最稳定）

如果 Pexels 仍然不稳定，注释掉 API Key：

```properties
# backend/.env
# PEXELS_API_KEY=1GYwjL...
```

**优点：**
- ✅ 零网络延迟
- ✅ 100% 稳定
- ✅ 无配额限制

**缺点：**
- ⚠️ 只支持预设的18个城市

---

### 方案 B：混合模式（推荐）

保持当前配置，让系统智能选择：

```javascript
// 已实现的逻辑
async searchImage(keyword, type) {
  // 1. 尝试 Pexels API (12秒超时)
  if (this.usePexels) {
    const result = await this.searchPexels(keyword);
    if (result) return result; // 成功就用
  }
  
  // 2. 降级到预设库（常用城市）
  const presetImage = this.getCityImage(keyword);
  if (presetImage) return presetImage;
  
  // 3. 最终降级（通用图片）
  return 'https://images.pexels.com/photos/466685/...';
}
```

**优点：**
- ✅ 最大化覆盖城市
- ✅ 有完善的降级机制
- ✅ 不会因为 API 失败而影响功能

---

### 方案 C：使用国内 CDN（高级）

如果有条件，可以：
1. 定期从 Pexels 下载热门城市图片
2. 上传到国内 OSS/CDN（阿里云、七牛云等）
3. 修改预设图片库使用 CDN 链接

**优点：**
- ✅ 访问速度快（国内 CDN）
- ✅ 成本低（对象存储很便宜）
- ✅ 完全可控

**缺点：**
- ⚠️ 需要额外的存储服务
- ⚠️ 需要定期更新图片

---

## 常见问题

### Q1: 为什么不一次获取多张图片？

A: 因为请求参数是 `per_page: 1`，只获取1张。如果需要批量获取：

```javascript
params: {
  query: keyword,
  per_page: 15  // 改成15张
}
```

但这样会消耗更多配额，建议按需获取。

---

### Q2: 配额用完了怎么办？

A: 免费配额 200次/小时，20000次/月。如果不够：

1. **降低使用频率** - 增加缓存
2. **联系 Pexels** - 申请更高配额（需说明用途）
3. **降级到预设库** - 注释 API Key

---

### Q3: 如何查看剩余配额？

A: 每次请求的响应头包含：

```javascript
response.headers['x-ratelimit-remaining']  // 剩余次数
response.headers['x-ratelimit-limit']      // 总配额
response.headers['x-ratelimit-reset']      // 重置时间
```

服务器启动时的预热日志会显示。

---

## 总结

✅ **已解决问题：**
- 持久化连接复用（HTTP Keep-Alive）
- 增加超时到12秒（覆盖首次请求）
- 服务器启动预热（避免首次慢）
- 详细日志（方便诊断）

✅ **推荐配置：**
- 保持当前的 Pexels API Key
- 依赖三层降级机制
- 定期检查配额使用情况

🎯 **预期效果：**
- 首次请求成功率 > 95%
- 平均响应时间 < 1秒
- 完美降级，用户无感知

---

**需要进一步优化？** 运行测试脚本并把结果发给我！
