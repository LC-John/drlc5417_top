# Qwen Chatbot Server

基于百炼 Qwen 模型的聊天机器人后端服务。

## 安装依赖

```bash
cd server
npm install
```

## 配置

1. 创建 `.env` 文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的百炼 API Key：
```
BAILIAN_API_KEY=your_actual_api_key_here
PORT=3000
```

## 运行服务器

```bash
npm start
```

服务器将在 http://localhost:3000 上运行。

## API 接口

### POST /api/chat
发送聊天消息并获取 Qwen 模型的回复。

**请求体：**
```json
{
  "message": "你好"
}
```

**响应：**
```json
{
  "reply": "你好！有什么我可以帮助你的吗？"
}
```

### GET /api/health
健康检查接口。

**响应：**
```json
{
  "status": "ok"
}
```

## 安全特性

- 使用 Helmet.js 增强 HTTP 头安全性
- CORS 限制仅允许特定来源
- 速率限制：每 15 分钟最多 100 次请求
- 输入验证：限制消息长度不超过 2000 字符
- API Key 仅存储在服务器环境变量中，不暴露给前端
