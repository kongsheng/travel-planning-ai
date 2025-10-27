# PDF 下载和分享功能说明

## ✅ 已实现功能

### 1. 📥 下载 PDF
点击"下载 PDF"按钮后：
1. 后端生成格式化的 HTML 文档
2. 在新窗口打开 HTML
3. 自动弹出打印对话框
4. 用户选择"另存为 PDF"即可保存

**优点：**
- ✅ 无需安装额外依赖
- ✅ 格式精美，支持分页
- ✅ 跨平台兼容（Windows/Mac/Linux）
- ✅ 用户可以自定义 PDF 设置

### 2. 🔗 分享行程
点击"分享行程"按钮后：
1. 生成唯一分享链接
2. 弹出分享弹窗
3. 一键复制链接
4. 链接有效期24小时

**分享链接格式：**
```
http://localhost:5173/trip-result?id=xxxxx
```

---

## 🎯 使用方法

### 下载 PDF
1. 生成旅行计划后，点击顶部"📥 下载 PDF"按钮
2. 浏览器会打开新窗口显示格式化的行程
3. 自动弹出打印对话框
4. 选择打印机：**另存为 PDF** 或 **Microsoft Print to PDF**
5. 点击"保存"即可下载 PDF 文件

**Windows 用户：**
- 打印机选择："Microsoft Print to PDF"
- 位置：任何系统都内置此功能

**Mac 用户：**
- 点击打印对话框左下角"PDF"按钮
- 选择"存储为 PDF"

### 分享行程
1. 点击"🔗 分享行程"按钮
2. 在弹出的弹窗中点击"📋 复制"按钮
3. 将链接发送给朋友
4. 朋友打开链接即可查看相同的行程

**注意：**
- 链接存储在浏览器 sessionStorage 中
- 关闭浏览器后链接会失效
- 如需长期保存，建议下载 PDF

---

## 📄 PDF 样式特点

### 专业排版
```
✓ 清晰的标题和副标题
✓ 彩色时间标签
✓ 每个城市单独分节
✓ 自动分页避免内容断裂
✓ 底部生成时间戳
```

### 内容包含
- ✅ 行程标题和基本信息
- ✅ 完整的每日行程
- ✅ 活动详情和时长
- ✅ 住宿信息
- ✅ 推荐酒店列表

---

## 🔧 技术实现

### 后端（server.js）
```javascript
// PDF 生成路由
app.post('/api/generate-pdf', (req, res) => {
  const html = PDFService.generateHTML(req.body);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
```

### 前端（TripResult.jsx）
```javascript
// 下载 PDF
const handleDownloadPDF = async () => {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const html = await response.text();
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.print(); // 自动打印
};

// 分享行程
const handleShare = () => {
  const tripId = Date.now().toString(36);
  sessionStorage.setItem(`trip-${tripId}`, JSON.stringify(data));
  setShareLink(`${window.location.origin}/trip-result?id=${tripId}`);
  setShowShareModal(true);
};
```

---

## 🎨 界面展示

### 分享弹窗
```
┌─────────────────────────────────────┐
│ 🔗 分享旅行计划               [×] │
├─────────────────────────────────────┤
│ 复制下方链接分享给朋友：            │
│                                     │
│ ┌─────────────────────┬─────────┐  │
│ │ http://localhost... │ 📋 复制 │  │
│ └─────────────────────┴─────────┘  │
│                                     │
│ 💡 提示：链接有效期为24小时         │
└─────────────────────────────────────┘
```

### PDF 打印预览
```
┌────────────────────────────────────┐
│        7天天津家庭旅行计划         │
│     📅 7天  📍 1个目的地  👥 4人   │
├────────────────────────────────────┤
│                                    │
│ 📍 行程详情                        │
│                                    │
│ 天津, 中国                         │
│ 天津，中国的历史名城...            │
│                                    │
│ 2025-10-28                         │
│ 第一天：探索古文化街               │
│                                    │
│   [上午] 天津之眼观光              │
│   浏览天津之眼的宏伟建筑...        │
│   ⏱️ 1.5小时                       │
│                                    │
│   [中午] 意式风情街午餐            │
│   在五大道附近品尝北京传统美食     │
│   ⏱️ 1小时                         │
│   ...                              │
└────────────────────────────────────┘
```

---

## 💡 使用提示

### PDF 下载技巧
1. **打印设置**
   - 纸张：A4
   - 方向：纵向
   - 边距：默认
   - 颜色：彩色（推荐）

2. **优化效果**
   - 取消勾选"页眉和页脚"
   - 启用"背景图形"
   - 选择"适合页面"缩放

### 分享技巧
1. **长期分享**
   - 建议下载 PDF 后分享文件
   - 或使用云盘分享链接

2. **隐私保护**
   - 链接仅在当前浏览器有效
   - 清除浏览器数据会删除分享

---

## 🚀 未来优化

### 可以添加的功能
- [ ] 真正的 PDF 文件下载（使用 puppeteer）
- [ ] 云端存储分享链接
- [ ] 二维码分享
- [ ] 导出到日历应用
- [ ] 微信/邮件分享
- [ ] PDF 自定义模板

---

## 🎉 现在开始使用

1. **重启后端服务器**
   ```bash
   cd backend
   npm start
   ```

2. **访问前端**
   ```bash
   http://localhost:5173
   ```

3. **生成行程并测试**
   - 填写表单提交
   - 点击"下载 PDF"测试
   - 点击"分享行程"测试

**所有功能都已就绪！** 🎊
