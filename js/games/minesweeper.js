class Minesweeper {
	constructor(config) {
		this.rows = config.rows || 10;
		this.cols = config.cols || 10;
		this.mines = config.mines || 10;
		
		this.boardElement = config.boardElement;
		this.counterElement = config.counterElement;
		this.timerElement = config.timerElement;
		this.resetButton = config.resetButton;
		
		this.onStateChange = config.onStateChange || (() => {});
		this.cellSize = config.cellSize || 30;
		this.useDoubleClick = config.useDoubleClick || false;
		
		this.board = [];
		this.revealed = [];
		this.flagged = [];
		this.gameOver = false;
		this.firstClick = true;
		this.timer = null;
		this.seconds = 0;
		
		this.lastClickTime = 0;
		this.lastClickCell = null;
		this.doubleClickDelay = 300;
		
		this.bindEvents();
	}
	
	bindEvents() {
		if (this.resetButton) {
			this.resetButton.addEventListener('click', () => this.init());
		}
		
		if (this.boardElement) {
			if (this.useDoubleClick) {
				this.boardElement.addEventListener('click', (e) => {
					if (e.target.classList.contains('mine-cell')) {
						const row = parseInt(e.target.getAttribute('data-row'));
						const col = parseInt(e.target.getAttribute('data-col'));
						const cellKey = `${row}-${col}`;
						const currentTime = Date.now();
						
						if (this.lastClickCell === cellKey && 
							currentTime - this.lastClickTime < this.doubleClickDelay) {
							this.toggleFlag(row, col);
							this.lastClickCell = null;
							this.lastClickTime = 0;
						} else {
							this.lastClickCell = cellKey;
							this.lastClickTime = currentTime;
							setTimeout(() => {
								if (this.lastClickCell === cellKey) {
									this.reveal(row, col);
									this.lastClickCell = null;
								}
							}, this.doubleClickDelay);
						}
					}
				});
				
				this.boardElement.addEventListener('contextmenu', (e) => {
					e.preventDefault();
				});
			} else {
				this.boardElement.addEventListener('click', (e) => {
					if (e.target.classList.contains('mine-cell')) {
						const row = parseInt(e.target.getAttribute('data-row'));
						const col = parseInt(e.target.getAttribute('data-col'));
						this.reveal(row, col);
					}
				});
				
				this.boardElement.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					if (e.target.classList.contains('mine-cell')) {
						const row = parseInt(e.target.getAttribute('data-row'));
						const col = parseInt(e.target.getAttribute('data-col'));
						this.toggleFlag(row, col);
					}
				});
			}
		}
	}
	
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
		this.onStateChange({ state: 'reset', emoji: '🙂' });
	}
	
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
	}
	
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
	}
	
	renderBoard() {
		if (!this.boardElement) return;
		
		this.boardElement.innerHTML = '';
		this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;
		
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				const cell = document.createElement('div');
				cell.className = 'mine-cell';
				cell.setAttribute('data-row', r);
				cell.setAttribute('data-col', c);
				
				if (this.revealed[r][c]) {
					cell.classList.add('revealed');
					if (this.board[r][c] === -1) {
						cell.classList.add('mine');
					} else if (this.board[r][c] > 0) {
						cell.textContent = this.board[r][c];
						cell.classList.add(`num-${this.board[r][c]}`);
					}
				} else if (this.flagged[r][c]) {
					cell.classList.add('flagged');
				}
				
				this.boardElement.appendChild(cell);
			}
		}
	}
	
	reveal(row, col) {
		if (this.gameOver || this.revealed[row][col]) return;
		
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
		
		this.revealed[row][col] = true;
		
		if (this.board[row][col] === -1) {
			this.gameOver = true;
			this.revealAll();
			this.onStateChange({ state: 'lose', emoji: '😵' });
			if (this.timer) clearInterval(this.timer);
			return;
		}
		
		if (this.board[row][col] === 0) {
			for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (dr === 0 && dc === 0) continue;
					const r = row + dr;
					const c = col + dc;
					if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
						this.reveal(r, c);
					}
				}
			}
		}
		
		this.renderBoard();
		this.checkWin();
	}
	
	toggleFlag(row, col) {
		if (this.gameOver || this.revealed[row][col]) return;
		
		this.flagged[row][col] = !this.flagged[row][col];
		this.renderBoard();
		this.updateMinesCounter();
		this.checkWin();
	}
	
	revealAll() {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				this.revealed[r][c] = true;
			}
		}
		this.renderBoard();
	}
	
	checkWin() {
		let revealedCount = 0;
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				if (this.revealed[r][c]) revealedCount++;
			}
		}
		
		if (revealedCount === this.rows * this.cols - this.mines) {
			this.gameOver = true;
			this.onStateChange({ state: 'win', emoji: '😎' });
			if (this.timer) clearInterval(this.timer);
		}
	}
	
	updateMinesCounter() {
		if (!this.counterElement) return;
		
		let flagCount = 0;
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				if (this.flagged[r][c]) flagCount++;
			}
		}
		const remaining = this.mines - flagCount;
		this.counterElement.textContent = String(remaining).padStart(3, '0');
	}
	
	startTimer() {
		this.timer = setInterval(() => {
			this.seconds++;
			this.updateTimer();
		}, 1000);
	}
	
	updateTimer() {
		if (!this.timerElement) return;
		this.timerElement.textContent = String(Math.min(this.seconds, 999)).padStart(3, '0');
	}
	
	destroy() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}
}

if (typeof window !== 'undefined') {
	window.Minesweeper = Minesweeper;
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Minesweeper;
}
