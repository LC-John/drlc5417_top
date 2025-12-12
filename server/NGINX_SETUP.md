# Nginx 配置步骤说明

## 1. 安装 Nginx

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install nginx
```

### CentOS/RHEL
```bash
sudo yum install epel-release
sudo yum install nginx
```

## 2. 配置 Nginx

### 方式一：使用配置文件（推荐）

```bash
# 1. 复制配置文件到 Nginx 配置目录
sudo cp nginx.conf /etc/nginx/sites-available/qwen-chatbot

# 2. 编辑配置文件，修改域名
sudo nano /etc/nginx/sites-available/qwen-chatbot
# 将所有 your-backend-domain.com 改为你的实际域名

# 3. 创建符号链接启用站点
sudo ln -s /etc/nginx/sites-available/qwen-chatbot /etc/nginx/sites-enabled/

# 4. 测试配置是否正确
sudo nginx -t

# 5. 重启 Nginx
sudo systemctl restart nginx
```

### 方式二：修改默认配置

```bash
# 编辑默认配置
sudo nano /etc/nginx/sites-available/default

# 将 nginx.conf 中的 server 块内容复制进去
```

## 3. 配置 HTTPS 证书（Let's Encrypt）

### 安装 Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### 获取证书
```bash
# 第一次配置（仅 HTTP）
# 1. 先注释掉 nginx.conf 中的 HTTPS server 块（listen 443 那一整块）
# 2. 只保留 HTTP server 块，重启 nginx
sudo nginx -t
sudo systemctl restart nginx

# 3. 申请证书
sudo certbot --nginx -d your-backend-domain.com

# 4. Certbot 会自动修改 nginx 配置
# 或者手动恢复完整的 nginx.conf 配置

# 自动续期（证书 90 天有效期）
sudo certbot renew --dry-run
```

证书会自动创建在：
- `/etc/letsencrypt/live/your-backend-domain.com/fullchain.pem`
- `/etc/letsencrypt/live/your-backend-domain.com/privkey.pem`

### 设置自动续期
```bash
# 添加到 crontab
sudo crontab -e

# 添加以下行（每天凌晨 2 点检查续期）
0 2 * * * certbot renew --quiet && systemctl reload nginx
```

## 4. 防火墙配置

### UFW (Ubuntu)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### Firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 5. 启动 Node.js 后端

```bash
cd /path/to/server

# 使用 PM2 管理进程
npm install -g pm2
pm2 start index.js --name qwen-chatbot

# 开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs qwen-chatbot
```

## 6. 验证配置

### 检查 Nginx 状态
```bash
sudo systemctl status nginx
```

### 检查 Node.js 是否运行
```bash
pm2 status
curl http://localhost:3000/api/health
```

### 测试外网访问
```bash
# 测试 HTTPS
curl https://your-backend-domain.com/api/health

# 应该返回：{"status":"ok"}
```

## 7. 常用命令

```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重新加载配置（无需停机）
sudo systemctl reload nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/qwen-chatbot-access.log
sudo tail -f /var/log/nginx/qwen-chatbot-error.log

# 查看 PM2 日志
pm2 logs qwen-chatbot

# 重启 Node.js 应用
pm2 restart qwen-chatbot
```

## 8. 故障排查

### 502 Bad Gateway
- 检查 Node.js 是否运行：`pm2 status`
- 检查端口是否正确：`netstat -tlnp | grep 3000`
- 查看 Node.js 日志：`pm2 logs`

### 证书错误
- 检查证书路径：`ls -la /etc/letsencrypt/live/your-backend-domain.com/`
- 手动续期：`sudo certbot renew`

### CORS 错误
- 已在 Node.js 代码中配置，无需在 Nginx 中额外配置

### 连接超时
- 检查防火墙：`sudo ufw status`
- 检查安全组（云服务器）：确保开放 80, 443 端口

## 9. 性能优化（可选）

```nginx
# 在 nginx.conf 的 http 块中添加
http {
    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;
    
    # 连接优化
    keepalive_timeout 65;
    client_max_body_size 10M;
}
```

## 10. 安全加固

```bash
# 禁用 Nginx 版本号显示
# 在 /etc/nginx/nginx.conf 的 http 块中添加
server_tokens off;

# 限制请求速率（已在 Node.js 中配置）
# 可选：在 Nginx 层面再加一层限制
```
