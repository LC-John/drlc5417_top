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
		
		window.desktopMinesweeperGame = minesweeperGame;
		window.desktopSnakeGame = snakeGame;
	}
}

if (typeof window !== 'undefined') {
	window.initDesktopUI = initDesktopUI;
}
