function initDesktopUI() {
	if (!window.ContentData) {
		console.error('ContentData not loaded');
		return;
	}
	
	const data = window.ContentData;
	
	renderAboutContent();
	renderWorksContent();
	renderGitHubContent();
	initDesktopGames();
	initDesktopEchoBot();
	
	function renderAboutContent() {
		const container = document.querySelector('#window-about .window-content');
		if (!container) return;
		
		container.innerHTML = `
			<div style="display: flex; gap: 20px; align-items: flex-start;">
				<div style="flex-shrink: 0;">
					<img src="${data.about.photo}" alt="My Photo" style="width: 150px; height: auto; border: 2px solid #808080; border-radius: 3px;">
				</div>
				<div style="flex: 1;">
					${data.about.bio.map(p => `<p>${p}</p>`).join('')}
					
					<p><b>Contact:</b><br>
					E-mail: ${data.about.contact.email}<br>
					WeChat: ${data.about.contact.wechat}<br>
					(${data.about.contact.wechatNote})<br>
					GitHub: ${data.about.contact.github.username} <a href="${data.about.contact.github.url}" target="_blank">[Link]</a></p>
				</div>
			</div>
		`;
	}
	
	function renderWorksContent() {
		const container = document.querySelector('#window-works .window-content');
		if (!container) return;
		
		let html = '<h3>Research Papers:</h3><p>';
		data.works.papers.forEach(paper => {
			html += `[*] ${paper.authors}. ${paper.title}. ${paper.venue}. <a href="${paper.url}" target="_blank">[Link]</a>`;
			if (paper.note) {
				html += ` ${paper.note}`;
			}
			html += '<br><br>\n';
		});
		html += '</p><h3>Projects:</h3><p>';
		data.works.projects.forEach(project => {
			html += `[*] ${project.name} -- ${project.description}. <a href="${project.url}" target="_blank">[Link]</a><br><br>\n`;
		});
		html += '</p>';
		
		container.innerHTML = html;
	}
	
	function renderGitHubContent() {
		const container = document.querySelector('#window-github .window-content');
		if (!container) return;
		
		container.innerHTML = `
			<div style="margin-bottom: 20px;">
				<img src="${data.github.profileImage}" alt="GitHub Profile" style="width: 200px; height: auto;">
			</div>
			<h2 style="margin-bottom: 20px;">${data.github.title}</h2>
			<p style="margin-bottom: 30px; color: #666;">${data.github.description}</p>
			<a href="${data.github.url}" target="_blank" style="
				display: inline-block;
				padding: 12px 30px;
				background-color: #000080;
				color: white;
				text-decoration: none;
				border: 2px solid;
				border-color: #ffffff #000000 #000000 #ffffff;
				font-weight: bold;
				font-size: 14px;
			" onmousedown="this.style.borderColor='#000000 #ffffff #ffffff #000000'" onmouseup="this.style.borderColor='#ffffff #000000 #000000 #ffffff'">
				Visit GitHub Profile
			</a>
		`;
	}
	
	function initDesktopGames() {
		if (window.desktopGamesInitialized) return;
		window.desktopGamesInitialized = true;
		
		const minesweeperGame = new Minesweeper({
			rows: 10,
			cols: 10,
			mines: 10,
			cellSize: 30,
			boardElement: document.getElementById('minesweeper-board'),
			counterElement: document.getElementById('mines-counter'),
			timerElement: document.getElementById('timer'),
			resetButton: document.getElementById('reset-btn'),
			onStateChange: (event) => {
				const resetBtn = document.getElementById('reset-btn');
				if (resetBtn && event.emoji) {
					resetBtn.textContent = event.emoji;
				}
			}
		});
		
		minesweeperGame.init();
		
		const snakeGame = new Snake({
			canvas: document.getElementById('snake-canvas'),
			gridSize: 20,
			tileCount: 20,
			scoreElement: document.getElementById('snake-score'),
			highScoreElement: document.getElementById('snake-high-score'),
			startButton: document.getElementById('snake-start-btn'),
			restartButton: document.getElementById('snake-restart-btn'),
			gameOverPanel: document.getElementById('snake-game-over'),
			finalScoreElement: document.getElementById('final-score'),
			gameOverHighScoreElement: document.getElementById('game-over-high-score'),
			onStateChange: (event) => {
				const startBtn = document.getElementById('snake-start-btn');
				if (startBtn && event.buttonText) {
					startBtn.textContent = event.buttonText;
				}
			}
		});
		
		const tetrisGame = new Tetris({
			canvas: document.getElementById('tetris-canvas'),
			cellSize: 30,
			scoreElement: document.getElementById('tetris-score'),
			levelElement: document.getElementById('tetris-level'),
			linesElement: document.getElementById('tetris-lines'),
			highScoreElement: document.getElementById('tetris-high-score'),
			startButton: document.getElementById('tetris-start-btn'),
			restartButton: document.getElementById('tetris-restart-btn'),
			gameOverPanel: document.getElementById('tetris-game-over'),
			finalScoreElement: document.getElementById('tetris-final-score'),
			gameOverHighScoreElement: document.getElementById('tetris-game-over-high-score'),
			onStateChange: (event) => {
				const startBtn = document.getElementById('tetris-start-btn');
				if (startBtn && event.buttonText) {
					startBtn.textContent = event.buttonText;
				}
			}
		});
		
		window.desktopMinesweeperGame = minesweeperGame;
		window.desktopSnakeGame = snakeGame;
		window.desktopTetrisGame = tetrisGame;
	}
	
	function initDesktopEchoBot() {
		if (window.desktopEchoBotInitialized) return;
		window.desktopEchoBotInitialized = true;
		
		const chatMessages = document.getElementById('chat-messages');
		const chatInput = document.getElementById('chat-input');
		const chatSendBtn = document.getElementById('chat-send-btn');
		
		function addMessage(text, isUser) {
			const messageDiv = document.createElement('div');
			messageDiv.className = 'chat-message ' + (isUser ? 'user' : 'bot');
			messageDiv.textContent = text;
			chatMessages.appendChild(messageDiv);
			chatMessages.scrollTop = chatMessages.scrollHeight;
			return messageDiv;
		}
		
		function sendMessage() {
			const message = chatInput.value.trim();
			if (!message) return;
			
			addMessage(message, true);
			chatInput.value = '';
			chatSendBtn.disabled = true;
			chatInput.disabled = true;
			
			const loadingMsg = addMessage('思考中...', false);
			
			fetch(window.ChatConfig.getApiUrl() + '/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: message })
			})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('网络请求失败');
				}
				return response.json();
			})
			.then(function(data) {
				loadingMsg.remove();
				addMessage(data.reply, false);
			})
			.catch(function(error) {
				loadingMsg.remove();
				addMessage('抱歉，发生了错误。请稍后再试。', false);
				console.error('Chat error:', error);
			})
			.finally(function() {
				chatSendBtn.disabled = false;
				chatInput.disabled = false;
				chatInput.focus();
			});
		}
		
		chatSendBtn.addEventListener('click', sendMessage);
		chatInput.addEventListener('keypress', function(e) {
			if (e.key === 'Enter') {
				sendMessage();
			}
		});
	}
}

if (typeof window !== 'undefined') {
	window.initDesktopUI = initDesktopUI;
}
