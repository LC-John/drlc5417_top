function initTabletUI() {
	if (!window.ContentData) {
		console.error('ContentData not loaded');
		return;
	}
	
	const data = window.ContentData;
	
	renderAboutContent();
	renderWorksContent();
	renderGitHubContent();
	initTabletGames();
	initTabletEchoBot();
	
	function renderAboutContent() {
		const container = document.querySelector('#tablet-app-about .tablet-app-content');
		if (!container) return;
		
		container.innerHTML = `
			<div class="about-photo">
				<img src="${data.about.photo}" alt="My Photo">
			</div>
			<div class="about-info">
				${data.about.bio.map(p => `<p>${p}</p>`).join('')}
				<p><b>Contact:</b><br>
				E-mail: ${data.about.contact.email}<br>
				WeChat: ${data.about.contact.wechat}<br>
				(${data.about.contact.wechatNote})<br>
				GitHub: ${data.about.contact.github.username} <a href="${data.about.contact.github.url}" target="_blank">[Link]</a></p>
			</div>
		`;
	}
	
	function renderWorksContent() {
		const container = document.querySelector('#tablet-app-works .tablet-app-content');
		if (!container) return;
		
		let html = '<h3>Research Papers:</h3>';
		data.works.papers.forEach(paper => {
			html += '<div class="paper-item">';
			html += `[*] ${paper.authors}. ${paper.title}. ${paper.venue}. <a href="${paper.url}" target="_blank">[Link]</a>`;
			if (paper.note) {
				html += ` ${paper.note}`;
			}
			html += '</div>';
		});
		html += '<h3>Projects:</h3>';
		data.works.projects.forEach(project => {
			html += '<div class="paper-item">';
			html += `[*] ${project.name} -- ${project.description}. <a href="${project.url}" target="_blank">[Link]</a>`;
			html += '</div>';
		});
		
		container.innerHTML = html;
	}
	
	function renderGitHubContent() {
		const container = document.querySelector('#tablet-app-github .tablet-app-content');
		if (!container) return;
		
		container.innerHTML = `
			<div style="margin-bottom: 25px;">
				<img src="${data.github.profileImage}" alt="GitHub Profile" style="width: 180px; height: auto;">
			</div>
			<h2 style="margin-bottom: 20px;">${data.github.title}</h2>
			<p style="margin-bottom: 25px; color: #666; font-size: 16px;">${data.github.description}</p>
			<a href="${data.github.url}" target="_blank" class="tablet-btn">
				Visit GitHub Profile
			</a>
		`;
	}
	
	function initTabletGames() {
		if (window.tabletGamesInitialized) return;
		window.tabletGamesInitialized = true;
		
		const minesweeperGame = new Minesweeper({
			rows: 12,
			cols: 12,
			mines: 20,
			cellSize: 50,
			boardElement: document.getElementById('tablet-minesweeper-board'),
			counterElement: document.getElementById('tablet-mines-counter'),
			timerElement: document.getElementById('tablet-timer'),
			resetButton: document.getElementById('tablet-reset-btn'),
			useDoubleClick: true,
			onStateChange: (event) => {
				const resetBtn = document.getElementById('tablet-reset-btn');
				if (resetBtn && event.emoji) {
					resetBtn.textContent = event.emoji;
				}
			}
		});
		
		minesweeperGame.init();
		
		const snakeGame = new Snake({
			canvas: document.getElementById('tablet-snake-canvas'),
			gridSize: 25,
			tileCount: 24,
			scoreElement: document.getElementById('tablet-snake-score'),
			highScoreElement: document.getElementById('tablet-snake-high-score'),
			startButton: document.getElementById('tablet-snake-start-btn'),
			restartButton: document.getElementById('tablet-snake-restart-btn'),
			gameOverPanel: document.getElementById('tablet-snake-game-over'),
			finalScoreElement: document.getElementById('tablet-final-score'),
			gameOverHighScoreElement: document.getElementById('tablet-game-over-high-score'),
			controlButtons: {
				up: document.getElementById('tablet-btn-up'),
				down: document.getElementById('tablet-btn-down'),
				left: document.getElementById('tablet-btn-left'),
				right: document.getElementById('tablet-btn-right')
			},
			onStateChange: (event) => {
				const startBtn = document.getElementById('tablet-snake-start-btn');
				if (startBtn && event.buttonText) {
					startBtn.textContent = event.buttonText;
				}
			}
		});
		
		window.tabletMinesweeperGame = minesweeperGame;
		window.tabletSnakeGame = snakeGame;
	}
	
	function initTabletEchoBot() {
		if (window.tabletEchoBotInitialized) return;
		window.tabletEchoBotInitialized = true;
		
		const chatMessages = document.getElementById('chat-messages-tablet');
		const chatInput = document.getElementById('chat-input-tablet');
		const chatSendBtn = document.getElementById('chat-send-btn-tablet');
		
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
	window.initTabletUI = initTabletUI;
}
