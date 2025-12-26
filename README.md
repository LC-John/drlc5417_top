# DrLC's Homepage

A creative multi-platform personal homepage featuring an OS-inspired interface with responsive designs for desktop, mobile, and tablet devices.

🌐 **Live Site**: [drlc5417.top](http://drlc5417.top)
Built with [Verdent](https://verdent.ai)

## Features

### 📱 Responsive Multi-Platform Design
- **Desktop**: Windows-style OS with draggable/resizable windows, taskbar, and start menu
- **Mobile**: iOS-style app grid interface with navigation
- **Tablet**: iPad-style layout with touch-optimized controls

### 📄 Content Sections
- **About Me**: Personal bio, education, career, and contact information
- **Publications**: 12 academic papers with integrated PDF viewers
- **GitHub**: Direct link to GitHub profile

### 🎮 Interactive Games
- **Minesweeper**: Classic mine-sweeping game
- **Snake**: Snake game with keyboard and touch controls
- **Tetris**: Full-featured Tetris with touch support for mobile/tablet

### 💬 AI Chat
- Real-time chat powered by Bailian API
- Integrated chatbot interface

### 🌓 Theme Support
- Light/Dark mode toggle
- Persistent theme preference

## Project Structure

```
.
├── css/                      # Stylesheets
│   ├── shared.css           # Shared styles
│   ├── os-desktop.css       # Desktop-specific styles
│   ├── os-mobile.css        # Mobile-specific styles
│   ├── os-tablet.css        # Tablet-specific styles
│   └── os-responsive.css    # Responsive layout rules
├── js/                       # JavaScript files
│   ├── shared/              # Shared modules
│   │   └── content-data.js  # Personal info and publications data
│   ├── games/               # Game implementations
│   │   ├── minesweeper.js
│   │   ├── snake.js
│   │   └── tetris.js
│   ├── desktop-ui.js        # Desktop UI rendering
│   ├── mobile-ui.js         # Mobile UI rendering
│   ├── tablet-ui.js         # Tablet UI rendering
│   ├── os-desktop.js        # Desktop OS logic
│   ├── os-mobile.js         # Mobile OS logic
│   ├── os-tablet.js         # Tablet OS logic
│   ├── os-responsive.js     # Responsive loader (entry point)
│   ├── config.js            # API configuration
│   └── jquery.min.js        # jQuery library
├── img/                      # Images
│   ├── me.jpg               # Profile photo
│   └── github_progile.png   # GitHub profile image
├── pdf/                      # Publication PDFs (12 files)
├── server/                   # Node.js backend
│   ├── index.js             # Express server
│   ├── package.json         # Dependencies
│   ├── nginx.conf           # Nginx configuration
│   ├── nginx-centos.conf    # Nginx config for CentOS
│   └── nginx-same-domain.conf  # Same-domain Nginx config
├── index.html               # Main entry point
└── .gitignore
```

## Tech Stack

### Frontend
- HTML5/CSS3
- JavaScript (ES6+)
- jQuery
- Canvas API (for games)

### Backend
- Node.js
- Express
- Bailian API (for AI chat)

## Local Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (for chat feature)

### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Open `index.html` in your browser:
```bash
open index.html
```

Or use a local server:
```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Backend Setup (Optional - for Chat feature)

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "BAILIAN_API_KEY=your_api_key_here" > .env
echo "PORT=3000" >> .env
```

4. Start the server:
```bash
node index.js
```

The chat feature will now be available when accessing the homepage.

## Configuration

### API Configuration

Edit `js/config.js` to configure the backend API URL:

```javascript
const ChatConfig = {
    getApiUrl: function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';  // Local development
        }
        return 'http://drlc5417.top';  // Production
    }
};
```

### Content Customization

Edit `js/shared/content-data.js` to update:
- Personal information (name, bio, contact)
- Publications list
- Project portfolio

## Deployment

### Frontend Deployment

The frontend is a static website and can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Cloudflare Pages

Simply upload all files to your hosting service.

### Backend Deployment

For the chat feature, deploy the `server/` directory to a Node.js hosting service:

1. **Cloud Servers**: AWS EC2, Google Cloud, DigitalOcean, etc.
   ```bash
   cd server
   npm install
   # Configure .env file
   npm install -g pm2
   pm2 start index.js --name chatbot
   pm2 save
   ```

2. **Configure Nginx** (recommended):
   - Use one of the provided nginx config files in `server/`
   - Set up SSL with Let's Encrypt for HTTPS

3. **Update API URL**:
   - Edit `js/config.js` with your production backend URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Author

**Zhang Huangzhao (张煌昭)**
- Email: zhang_hz@pku.edu.cn
- GitHub: [@LC-John](https://github.com/LC-John)
- WeChat: dr__lc

---

Built with [Verdent](https://verdent.ai) - AI-powered software engineering assistant

## License

Personal project - All rights reserved
