# 部署指南

## 本地开发环境

当在 `localhost` 或 `127.0.0.1` 访问时，会自动连接到本地后端 `http://localhost:3000`。

## 生产环境部署

### 1. 前端部署

前端可以部署到任何静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- 阿里云 OSS
- 腾讯云 COS

只需将所有文件上传即可。

### 2. 后端部署

后端需要部署到支持 Node.js 的服务器，例如：

**选项 A：云服务器（推荐）**
- 阿里云 ECS
- 腾讯云 CVM
- AWS EC2

部署步骤：
```bash
# 1. 上传 server 目录到服务器
# 2. 安装依赖
cd server
npm install

# 3. 配置环境变量
echo "BAILIAN_API_KEY=your_api_key" > .env
echo "PORT=3000" >> .env

# 4. 使用 PM2 运行（推荐）
npm install -g pm2
pm2 start index.js --name qwen-chatbot
pm2 save
pm2 startup

# 5. 配置 Nginx 反向代理（推荐）
# 在 /etc/nginx/sites-available/ 创建配置文件
```

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-backend-domain.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**选项 B：Serverless 平台**
- Vercel（需要改造为 Serverless Function）
- 阿里云函数计算
- 腾讯云云函数

### 3. 配置后端地址

编辑 `js/config.js`，将 `your-backend-domain.com` 替换为你的实际后端域名：

```javascript
return 'https://your-backend-domain.com';  // 改为你的域名
```

### 4. HTTPS 配置（重要）

生产环境必须使用 HTTPS：
1. 使用 Let's Encrypt 免费证书
2. 配置 Nginx SSL

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-backend-domain.com
```

## 环境变量

后端需要以下环境变量：
- `BAILIAN_API_KEY`: 百炼 API 密钥（必需）
- `PORT`: 服务端口（默认 3000）

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到 Git
2. 使用 HTTPS 加密传输
3. 定期更新依赖包
4. 配置防火墙规则
5. 启用请求速率限制（已集成）

## 测试部署

1. 前端访问地址：`https://your-frontend-domain.com`
2. 后端健康检查：`https://your-backend-domain.com/api/health`
3. 打开聊天窗口测试对话功能
