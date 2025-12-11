function initMobileOS() {
	if (window.mobileOSInitialized) return;
	window.mobileOSInitialized = true;

	function updateTime() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const mobileTimeEl = document.getElementById('mobile-time');
		if (mobileTimeEl) {
			mobileTimeEl.textContent = `${hours}:${minutes}`;
		}
	}

	updateTime();
	setInterval(updateTime, 60000);

	const mobileApps = document.querySelectorAll('.mobile-app');
	mobileApps.forEach(function(app) {
		app.addEventListener('click', function() {
			const appName = this.getAttribute('data-app');
			const appView = document.getElementById('mobile-app-' + appName);
			if (appView) {
				appView.classList.add('active');
				document.getElementById('mobile-home-screen').style.display = 'none';
			}
		});
	});

	const backBtns = document.querySelectorAll('.back-btn');
	backBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			const appView = this.closest('.mobile-app-view');
			if (appView) {
				appView.classList.remove('active');
			}
			document.getElementById('mobile-home-screen').style.display = 'flex';
		});
	});

	const homeBtn = document.getElementById('home-btn');
	if (homeBtn) {
		homeBtn.addEventListener('click', function() {
			const activeViews = document.querySelectorAll('.mobile-app-view.active');
			activeViews.forEach(function(view) {
				view.classList.remove('active');
			});
			document.getElementById('mobile-home-screen').style.display = 'flex';
		});
	}

	setTimeout(function() {
		const themeBtn = document.getElementById('theme-btn-mobile');
		if (themeBtn) {
			const savedTheme = localStorage.getItem('mobileTheme') || 'light';
			if (savedTheme === 'dark') {
				document.body.classList.add('dark-theme');
				themeBtn.classList.add('dimmed');
			} else {
				themeBtn.classList.remove('dimmed');
			}

			themeBtn.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				document.body.classList.toggle('dark-theme');
				if (document.body.classList.contains('dark-theme')) {
					themeBtn.classList.add('dimmed');
					localStorage.setItem('mobileTheme', 'dark');
				} else {
					themeBtn.classList.remove('dimmed');
					localStorage.setItem('mobileTheme', 'light');
				}
			});
		}
	}, 100);

	const minesweeper = {
		rows: 8,
		cols: 8,
		mines: 10,
		board: [],
		revealed: [],
		flagged: [],
		gameOver: false,
		firstClick: true,
		timer: null,
		seconds: 0,

		init() {
			this.board = [];
			this.revealed = [];
			this.flagged = [];
			this.gameOver = false;
			this.firstClick = true;
			this.seconds = 0;
			if (this.timer) clearInterval(this.timer);
			
			for (let r = 0; r < this.rows; r++) {
				this.board[r] = [];
				this.revealed[r] = [];
				this.flagged[r] = [];
				for (let c = 0; c < this.cols; c++) {
					this.board[r][c] = 0;
					this.revealed[r][c] = false;
					this.flagged[r][c] = false;
				}
			}
			
			this.renderBoard();
			this.updateMinesCounter();
			this.updateTimer();
			const resetBtn = document.getElementById('reset-btn-mobile');
			if (resetBtn) resetBtn.textContent = '🙂';
		},

		placeMines(avoidRow, avoidCol) {
			let placed = 0;
			while (placed < this.mines) {
				const r = Math.floor(Math.random() * this.rows);
				const c = Math.floor(Math.random() * this.cols);
				if (this.board[r][c] !== -1 && !(r === avoidRow && c === avoidCol)) {
					this.board[r][c] = -1;
					placed++;
				}
			}
			
			for (let r = 0; r < this.rows; r++) {
				for (let c = 0; c < this.cols; c++) {
					if (this.board[r][c] !== -1) {
						this.board[r][c] = this.countAdjacentMines(r, c);
					}
				}
			}
		},

		countAdjacentMines(row, col) {
			let count = 0;
			for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (dr === 0 && dc === 0) continue;
					const r = row + dr;
					const c = col + dc;
					if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === -1) {
						count++;
					}
				}
			}
			return count;
		},

		renderBoard() {
			const board = document.getElementById('minesweeper-board-mobile');
			if (!board) return;
			
			board.innerHTML = '';
			board.style.cssText = 'display: grid; grid-template-columns: repeat(' + this.cols + ', 35px); gap: 2px; justify-content: center; margin: 10px auto;';
			
			for (let r = 0; r < this.rows; r++) {
				for (let c = 0; c < this.cols; c++) {
					const cell = document.createElement('div');
					cell.className = 'mine-cell';
					cell.setAttribute('data-row', r);
					cell.setAttribute('data-col', c);
					cell.style.cssText = 'width: 35px; height: 35px; background: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; cursor: pointer; user-select: none;';
					
					if (this.revealed[r][c]) {
						cell.style.cssText += ' background: #e0e0e0; border-color: #808080;';
						if (this.board[r][c] === -1) {
							cell.textContent = '💣';
							cell.style.background = '#ff0000';
						} else if (this.board[r][c] > 0) {
							cell.textContent = this.board[r][c];
							const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
							cell.style.color = colors[this.board[r][c]];
						}
					} else if (this.flagged[r][c]) {
						cell.textContent = '🚩';
					}
					
					cell.addEventListener('click', this.handleCellClick.bind(this));
					cell.addEventListener('contextmenu', this.handleRightClick.bind(this));
					
					board.appendChild(cell);
				}
			}
		},

		handleCellClick(e) {
			e.preventDefault();
			if (this.gameOver) return;
			
			const row = parseInt(e.target.getAttribute('data-row'));
			const col = parseInt(e.target.getAttribute('data-col'));
			
			if (this.flagged[row][col]) {
				this.flagged[row][col] = false;
				this.renderBoard();
				this.updateMinesCounter();
				return;
			}
			
			if (this.firstClick) {
				this.placeMines(row, col);
				this.firstClick = false;
				this.startTimer();
			}
			
			if (this.board[row][col] === -1) {
				this.revealAll();
				this.gameOver = true;
				if (this.timer) clearInterval(this.timer);
				const resetBtn = document.getElementById('reset-btn-mobile');
				if (resetBtn) resetBtn.textContent = '😵';
			} else {
				this.reveal(row, col);
				this.renderBoard();
				this.checkWin();
			}
		},

		handleRightClick(e) {
			e.preventDefault();
			if (this.gameOver) return;
			
			const row = parseInt(e.target.getAttribute('data-row'));
			const col = parseInt(e.target.getAttribute('data-col'));
			
			if (this.revealed[row][col]) return;
			
			this.flagged[row][col] = !this.flagged[row][col];
			this.renderBoard();
			this.updateMinesCounter();
			this.checkWin();
		},

		reveal(row, col) {
			if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
			if (this.revealed[row][col] || this.flagged[row][col]) return;
			
			this.revealed[row][col] = true;
			
			if (this.board[row][col] === 0) {
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						if (dr === 0 && dc === 0) continue;
						this.reveal(row + dr, col + dc);
					}
				}
			}
		},

		revealAll() {
			for (let r = 0; r < this.rows; r++) {
				for (let c = 0; c < this.cols; c++) {
					this.revealed[r][c] = true;
				}
			}
			this.renderBoard();
		},

		checkWin() {
			let allRevealed = true;
			for (let r = 0; r < this.rows; r++) {
				for (let c = 0; c < this.cols; c++) {
					if (this.board[r][c] !== -1 && !this.revealed[r][c]) {
						allRevealed = false;
						break;
					}
				}
			}
			
			if (allRevealed) {
				this.gameOver = true;
				if (this.timer) clearInterval(this.timer);
				const resetBtn = document.getElementById('reset-btn-mobile');
				if (resetBtn) resetBtn.textContent = '😎';
			}
		},

		startTimer() {
			this.timer = setInterval(() => {
				this.seconds++;
				this.updateTimer();
			}, 1000);
		},

		updateTimer() {
			const timerEl = document.getElementById('timer-mobile');
			if (timerEl) {
				timerEl.textContent = String(Math.min(this.seconds, 999)).padStart(3, '0');
			}
		},

		updateMinesCounter() {
			let flaggedCount = 0;
			for (let r = 0; r < this.rows; r++) {
				for (let c = 0; c < this.cols; c++) {
					if (this.flagged[r][c]) flaggedCount++;
				}
			}
			const counterEl = document.getElementById('mines-counter-mobile');
			if (counterEl) {
				counterEl.textContent = String(Math.max(0, this.mines - flaggedCount)).padStart(3, '0');
			}
		}
	};

	const resetBtnMobile = document.getElementById('reset-btn-mobile');
	if (resetBtnMobile) {
		resetBtnMobile.addEventListener('click', function() {
			minesweeper.init();
		});
		minesweeper.init();
	}

	const snake = {
		canvas: null,
		ctx: null,
		gridSize: 15,
		tileCount: 20,
		snake: [],
		food: {},
		dx: 0,
		dy: 0,
		score: 0,
		highScore: 0,
		gameLoop: null,
		gameRunning: false,

		init() {
			this.canvas = document.getElementById('snake-canvas-mobile');
			if (!this.canvas) return;
			
			this.ctx = this.canvas.getContext('2d');
			this.gridSize = this.canvas.width / this.tileCount;
			this.highScore = parseInt(localStorage.getItem('snakeHighScoreMobile') || '0');
			this.updateHighScore();
			this.reset();
		},

		reset() {
			const center = Math.floor(this.tileCount / 2);
			this.snake = [
				{ x: center, y: center },
				{ x: center - 1, y: center },
				{ x: center - 2, y: center }
			];
			this.dx = 0;
			this.dy = 0;
			this.score = 0;
			this.updateScore();
			this.placeFood();
			this.draw();
			const startBtn = document.getElementById('snake-start-btn-mobile');
			if (startBtn) startBtn.textContent = 'Start';
		},

		start() {
			if (this.gameRunning) return;
			this.gameRunning = true;
			if (this.dx === 0 && this.dy === 0) {
				this.dx = 1;
				this.dy = 0;
			}
			this.gameLoop = setInterval(() => this.update(), 150);
			const startBtn = document.getElementById('snake-start-btn-mobile');
			if (startBtn) startBtn.textContent = 'Pause';
		},

		pause() {
			if (!this.gameRunning) return;
			if (this.gameLoop) {
				clearInterval(this.gameLoop);
				this.gameLoop = null;
			}
			this.gameRunning = false;
			const startBtn = document.getElementById('snake-start-btn-mobile');
			if (startBtn) startBtn.textContent = 'Resume';
		},

		stop() {
			if (this.gameLoop) {
				clearInterval(this.gameLoop);
				this.gameLoop = null;
			}
			this.gameRunning = false;
		},

		update() {
			const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
			
			if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
				this.gameOver();
				return;
			}
			
			for (let segment of this.snake) {
				if (segment.x === head.x && segment.y === head.y) {
					this.gameOver();
					return;
				}
			}
			
			this.snake.unshift(head);
			
			if (head.x === this.food.x && head.y === this.food.y) {
				this.score += 10;
				this.updateScore();
				this.placeFood();
			} else {
				this.snake.pop();
			}
			
			this.draw();
		},

		placeFood() {
			do {
				this.food = {
					x: Math.floor(Math.random() * this.tileCount),
					y: Math.floor(Math.random() * this.tileCount)
				};
			} while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
		},

		draw() {
			if (!this.ctx) return;
			
			this.ctx.fillStyle = '#000';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			
			this.ctx.fillStyle = '#0f0';
			for (let segment of this.snake) {
				this.ctx.fillRect(
					segment.x * this.gridSize,
					segment.y * this.gridSize,
					this.gridSize - 2,
					this.gridSize - 2
				);
			}
			
			this.ctx.fillStyle = '#f00';
			this.ctx.fillRect(
				this.food.x * this.gridSize,
				this.food.y * this.gridSize,
				this.gridSize - 2,
				this.gridSize - 2
			);
		},

		updateScore() {
			const scoreEl = document.getElementById('snake-score-mobile');
			if (scoreEl) scoreEl.textContent = this.score;
		},

		updateHighScore() {
			const highScoreEl = document.getElementById('snake-high-score-mobile');
			if (highScoreEl) highScoreEl.textContent = this.highScore;
			const gameOverHighScoreEl = document.getElementById('game-over-high-score-mobile');
			if (gameOverHighScoreEl) gameOverHighScoreEl.textContent = this.highScore;
		},

		gameOver() {
			this.stop();
			
			if (this.score > this.highScore) {
				this.highScore = this.score;
				localStorage.setItem('snakeHighScoreMobile', this.highScore);
				this.updateHighScore();
			}
			
			const finalScoreEl = document.getElementById('final-score-mobile');
			if (finalScoreEl) finalScoreEl.textContent = this.score;
			
			const gameOverEl = document.getElementById('snake-game-over-mobile');
			if (gameOverEl) gameOverEl.style.display = 'flex';
		},

		changeDirection(newDx, newDy) {
			if (this.dx === -newDx && this.dy === -newDy) return;
			this.dx = newDx;
			this.dy = newDy;
		}
	};

	const startBtnMobile = document.getElementById('snake-start-btn-mobile');
	if (startBtnMobile) {
		startBtnMobile.addEventListener('click', function() {
			if (snake.gameRunning) {
				snake.pause();
			} else if (startBtnMobile.textContent === 'Resume') {
				snake.start();
			} else {
				snake.reset();
				snake.start();
			}
		});
	}

	const restartBtnMobile = document.getElementById('snake-restart-btn-mobile');
	if (restartBtnMobile) {
		restartBtnMobile.addEventListener('click', function() {
			const gameOverEl = document.getElementById('snake-game-over-mobile');
			if (gameOverEl) gameOverEl.style.display = 'none';
			snake.reset();
			snake.start();
		});
	}

	const snakeCanvas = document.getElementById('snake-canvas-mobile');
	if (snakeCanvas) {
		snake.init();
		
		snakeCanvas.addEventListener('click', function(e) {
			if (!snake.gameRunning) return;
			
			const rect = snakeCanvas.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const clickY = e.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			
			const dx = clickX - centerX;
			const dy = clickY - centerY;
			
			if (Math.abs(dx) > Math.abs(dy)) {
				if (dx > 0) {
					snake.changeDirection(1, 0);
				} else {
					snake.changeDirection(-1, 0);
				}
			} else {
				if (dy > 0) {
					snake.changeDirection(0, 1);
				} else {
					snake.changeDirection(0, -1);
				}
			}
		});
	}

	const btnUpMobile = document.getElementById('btn-up-mobile');
	if (btnUpMobile) {
		btnUpMobile.addEventListener('click', function() {
			if (snake.gameRunning) {
				snake.changeDirection(0, -1);
			}
		});
	}

	const btnDownMobile = document.getElementById('btn-down-mobile');
	if (btnDownMobile) {
		btnDownMobile.addEventListener('click', function() {
			if (snake.gameRunning) {
				snake.changeDirection(0, 1);
			}
		});
	}

	const btnLeftMobile = document.getElementById('btn-left-mobile');
	if (btnLeftMobile) {
		btnLeftMobile.addEventListener('click', function() {
			if (snake.gameRunning) {
				snake.changeDirection(-1, 0);
			}
		});
	}

	const btnRightMobile = document.getElementById('btn-right-mobile');
	if (btnRightMobile) {
		btnRightMobile.addEventListener('click', function() {
			if (snake.gameRunning) {
				snake.changeDirection(1, 0);
			}
		});
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initMobileOS);
} else {
	initMobileOS();
}
