# 同域名部署指南
# 前端和后端都部署在 drlc5417.top

## 架构说明

```
https://drlc5417.top          → 前端静态文件（HTML/CSS/JS）
https://drlc5417.top/api/chat → 后端 Node.js API（反向代理到 localhost:3000）
```

## 部署步骤

### 1. 服务器准备

确保你的服务器已经：
- 安装了 Node.js
- 安装了 Nginx
- 域名 drlc5417.top 已指向服务器 IP

### 2. 部署后端

```bash
# 1. 创建项目目录
sudo mkdir -p /opt/qwen-chatbot
cd /opt/qwen-chatbot

# 2. 上传 server 目录内容到这里
# 或者使用 git clone / scp 等方式

# 3. 安装依赖
npm install

# 4. 配置环境变量
nano .env
# 内容：
# BAILIAN_API_KEY=你的百炼API密钥
# PORT=3000

# 5. 使用 PM2 运行
npm install -g pm2
pm2 start index.js --name qwen-chatbot
pm2 save
pm2 startup
```

### 3. 部署前端

```bash
# 1. 创建前端目录
sudo mkdir -p /var/www/drlc5417.top

# 2. 上传前端文件（除了 server 目录）
# 需要上传：
# - index.html
# - css/
# - js/
# - img/
# 不要上传 server/ 目录

# 示例：使用 scp
scp -r css js img index.html user@your-server-ip:/var/www/drlc5417.top/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/drlc5417.top
sudo chmod -R 755 /var/www/drlc5417.top
```

### 4. 配置 Nginx

```bash
# 1. 创建配置文件
sudo nano /etc/nginx/sites-available/drlc5417

# 2. 粘贴 nginx-same-domain.conf 的内容

# 3. 启用站点
sudo ln -s /etc/nginx/sites-available/drlc5417 /etc/nginx/sites-enabled/

# 4. 删除默认站点（如果存在）
sudo rm /etc/nginx/sites-enabled/default

# 5. 测试配置
sudo nginx -t

# 6. 重启 Nginx
sudo systemctl restart nginx
```

### 5. 配置 SSL 证书

```bash
# 1. 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d drlc5417.top -d www.drlc5417.top

# 3. 测试自动续期
sudo certbot renew --dry-run

# 4. 设置自动续期（添加到 crontab）
sudo crontab -e
# 添加：
0 2 * * * certbot renew --quiet && systemctl reload nginx
```

### 6. 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status

# 或者 firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 7. 验证部署

```bash
# 1. 检查后端是否运行
pm2 status
curl http://localhost:3000/api/health

# 2. 检查 Nginx
sudo systemctl status nginx

# 3. 测试外网访问
curl https://drlc5417.top/api/health
# 应该返回：{"status":"ok"}

# 4. 浏览器访问
# 打开 https://drlc5417.top
# 测试聊天功能
```

## 目录结构

```
服务器目录结构：

/opt/qwen-chatbot/          # 后端代码
├── index.js
├── package.json
├── .env                    # 环境变量（不要提交到 git）
└── node_modules/

/var/www/drlc5417.top/      # 前端代码
├── index.html
├── css/
├── js/
│   ├── config.js           # 已配置为 https://drlc5417.top
│   ├── desktop-ui.js
│   ├── mobile-ui.js
│   └── ...
└── img/

/etc/nginx/sites-available/drlc5417  # Nginx 配置
```

## 更新代码

### 更新前端
```bash
# 上传新文件
scp -r css js img index.html user@server:/var/www/drlc5417.top/

# 或者使用 git
cd /var/www/drlc5417.top
git pull
```

### 更新后端
```bash
cd /opt/qwen-chatbot
git pull  # 或者上传新文件
npm install
pm2 restart qwen-chatbot
```

## 故障排查

### 聊天功能不工作

1. **检查后端状态**
```bash
pm2 logs qwen-chatbot
pm2 status
```

2. **检查 API 是否可访问**
```bash
curl https://drlc5417.top/api/health
```

3. **检查浏览器控制台**
- 打开开发者工具 (F12)
- 查看 Network 标签
- 查看 /api/chat 请求的状态和响应

4. **检查 Nginx 日志**
```bash
sudo tail -f /var/log/nginx/drlc5417-error.log
sudo tail -f /var/log/nginx/drlc5417-access.log
```

### CORS 错误

已在 Node.js 代码中配置，无需额外设置。如果仍有问题：
```bash
# 重启后端
pm2 restart qwen-chatbot

# 重启 Nginx
sudo systemctl restart nginx
```

### 502 Bad Gateway

说明 Nginx 无法连接到后端：
```bash
# 检查后端是否运行
pm2 status

# 检查端口
netstat -tlnp | grep 3000

# 重启后端
pm2 restart qwen-chatbot
```

## 安全建议

1. ✅ 已启用 HTTPS
2. ✅ 已配置安全头
3. ✅ 已配置速率限制（在 Node.js 层）
4. ✅ API Key 存储在服务器环境变量
5. ✅ 禁止访问隐藏文件

额外建议：
- 定期更新系统和依赖包
- 使用强密码和 SSH 密钥登录
- 配置防火墙只开放必要端口
- 定期备份数据
