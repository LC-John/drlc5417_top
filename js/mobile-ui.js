function initMobileUI() {
	if (!window.ContentData) {
		console.error('ContentData not loaded');
		return;
	}
	
	const data = window.ContentData;
	
	renderAboutContent();
	renderWorksContent();
	renderGitHubContent();
	initMobileGames();
	initMobileEchoBot();
	
	function renderAboutContent() {
		const container = document.querySelector('#mobile-app-about .mobile-app-content');
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
		const container = document.querySelector('#mobile-app-works .mobile-app-content');
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
		const container = document.querySelector('#mobile-app-github .mobile-app-content');
		if (!container) return;
		
		container.innerHTML = `
			<div style="margin-bottom: 20px;">
				<img src="${data.github.profileImage}" alt="GitHub Profile" style="width: 150px; height: auto;">
			</div>
			<h2 style="margin-bottom: 15px;">${data.github.title}</h2>
			<p style="margin-bottom: 20px; color: #666;">${data.github.description}</p>
			<a href="${data.github.url}" target="_blank" class="mobile-btn">
				Visit GitHub Profile
			</a>
		`;
	}
	
	function initMobileGames() {
		if (window.mobileGamesInitialized) return;
		window.mobileGamesInitialized = true;
		
		const minesweeperGame = new Minesweeper({
			rows: 8,
			cols: 8,
			mines: 10,
			cellSize: 35,
			boardElement: document.getElementById('minesweeper-board-mobile'),
			counterElement: document.getElementById('mines-counter-mobile'),
			timerElement: document.getElementById('timer-mobile'),
			resetButton: document.getElementById('reset-btn-mobile'),
			useDoubleClick: true,
			onStateChange: (event) => {
				const resetBtn = document.getElementById('reset-btn-mobile');
				if (resetBtn && event.emoji) {
					resetBtn.textContent = event.emoji;
				}
			}
		});
		
		minesweeperGame.init();
		
		const snakeGame = new Snake({
			canvas: document.getElementById('snake-canvas-mobile'),
			gridSize: 15,
			tileCount: 20,
			scoreElement: document.getElementById('snake-score-mobile'),
			highScoreElement: document.getElementById('snake-high-score-mobile'),
			startButton: document.getElementById('snake-start-btn-mobile'),
			restartButton: document.getElementById('snake-restart-btn-mobile'),
			gameOverPanel: document.getElementById('snake-game-over-mobile'),
			finalScoreElement: document.getElementById('final-score-mobile'),
			gameOverHighScoreElement: document.getElementById('game-over-high-score-mobile'),
			controlButtons: {
				up: document.getElementById('btn-up-mobile'),
				down: document.getElementById('btn-down-mobile'),
				left: document.getElementById('btn-left-mobile'),
				right: document.getElementById('btn-right-mobile')
			},
			onStateChange: (event) => {
				const startBtn = document.getElementById('snake-start-btn-mobile');
				if (startBtn && event.buttonText) {
					startBtn.textContent = event.buttonText;
				}
			}
		});
		
		window.mobileMinesweeperGame = minesweeperGame;
		window.mobileSnakeGame = snakeGame;
	}
	
	function initMobileEchoBot() {
		if (window.mobileEchoBotInitialized) return;
		window.mobileEchoBotInitialized = true;
		
		const chatMessages = document.getElementById('chat-messages-mobile');
		const chatInput = document.getElementById('chat-input-mobile');
		const chatSendBtn = document.getElementById('chat-send-btn-mobile');
		
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
	window.initMobileUI = initMobileUI;
}
