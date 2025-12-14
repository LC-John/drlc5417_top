class Tetris {
	constructor(config) {
		this.canvas = config.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.cols = config.cols || 10;
		this.rows = config.rows || 20;
		this.cellSize = config.cellSize || 30;
		
		this.scoreElement = config.scoreElement;
		this.levelElement = config.levelElement;
		this.linesElement = config.linesElement;
		this.highScoreElement = config.highScoreElement;
		this.startButton = config.startButton;
		this.restartButton = config.restartButton;
		this.gameOverPanel = config.gameOverPanel;
		this.finalScoreElement = config.finalScoreElement;
		this.gameOverHighScoreElement = config.gameOverHighScoreElement;
		
		this.controlButtons = config.controlButtons || {};
		this.enableTouchControl = config.enableTouchControl || false;
		this.onStateChange = config.onStateChange || (() => {});
		
		this.board = [];
		this.currentPiece = null;
		this.currentX = 0;
		this.currentY = 0;
		this.score = 0;
		this.level = 1;
		this.lines = 0;
		this.highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
		this.gameLoop = null;
		this.isRunning = false;
		this.isPaused = false;
		this.dropInterval = 500;
		
		this.colors = [
			'#000000',
			'#00FFFF',
			'#FFFF00',
			'#800080',
			'#00FF00',
			'#FF0000',
			'#0000FF',
			'#FFA500'
		];
		
		this.pieces = {
			I: [[1,1,1,1]],
			O: [[1,1],[1,1]],
			T: [[0,1,0],[1,1,1]],
			S: [[0,1,1],[1,1,0]],
			Z: [[1,1,0],[0,1,1]],
			J: [[1,0,0],[1,1,1]],
			L: [[0,0,1],[1,1,1]]
		};
		
		this.pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
		
		this.bindEvents();
		this.updateHighScore();
	}
	
	bindEvents() {
		if (this.startButton) {
			this.startButton.addEventListener('click', () => {
				if (!this.isRunning) {
					this.start();
				} else if (this.isPaused) {
					this.resume();
				} else {
					this.pause();
				}
			});
		}
		
		if (this.restartButton) {
			this.restartButton.addEventListener('click', () => {
				if (this.gameOverPanel) {
					this.gameOverPanel.style.display = 'none';
				}
				this.start();
			});
		}
		
		if (this.enableTouchControl && this.canvas) {
			const handleCanvasClick = (e) => {
				if (!this.isRunning || this.isPaused) return;
				
				const rect = this.canvas.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				
				const canvasWidth = rect.width;
				const canvasHeight = rect.height;
				
				const topThreshold = canvasHeight * 0.25;
				const bottomThreshold = canvasHeight * 0.75;
				const leftThreshold = canvasWidth * 0.33;
				const rightThreshold = canvasWidth * 0.67;
				
				if (y < topThreshold) {
					this.rotate();
				} else if (y > bottomThreshold) {
					this.hardDrop();
				} else {
					if (x < leftThreshold) {
						this.moveLeft();
					} else if (x > rightThreshold) {
						this.moveRight();
					} else {
						this.moveDown();
					}
				}
			};
			
			this.canvas.addEventListener('click', handleCanvasClick);
			this.canvas.addEventListener('touchstart', (e) => {
				e.preventDefault();
				if (e.touches.length > 0) {
					const touch = e.touches[0];
					handleCanvasClick(touch);
				}
			});
		}
		
		if (this.controlButtons.left) {
			this.controlButtons.left.addEventListener('click', () => this.moveLeft());
		}
		if (this.controlButtons.right) {
			this.controlButtons.right.addEventListener('click', () => this.moveRight());
		}
		if (this.controlButtons.down) {
			this.controlButtons.down.addEventListener('click', () => this.moveDown());
		}
		if (this.controlButtons.rotate) {
			this.controlButtons.rotate.addEventListener('click', () => this.rotate());
		}
		if (this.controlButtons.drop) {
			this.controlButtons.drop.addEventListener('click', () => this.hardDrop());
		}
		
		document.addEventListener('keydown', (e) => {
			if (!this.isRunning || this.isPaused) return;
			
			switch(e.key) {
				case 'ArrowLeft':
				case 'a':
				case 'A':
					e.preventDefault();
					this.moveLeft();
					break;
				case 'ArrowRight':
				case 'd':
				case 'D':
					e.preventDefault();
					this.moveRight();
					break;
				case 'ArrowDown':
				case 's':
				case 'S':
					e.preventDefault();
					this.moveDown();
					break;
				case 'ArrowUp':
				case 'w':
				case 'W':
					e.preventDefault();
					this.rotate();
					break;
				case ' ':
					e.preventDefault();
					this.hardDrop();
					break;
			}
		});
	}
	
	reset() {
		this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
		this.score = 0;
		this.level = 1;
		this.lines = 0;
		this.dropInterval = 500;
		this.isPaused = false;
		this.spawnPiece();
		this.updateScore();
		this.updateLevel();
		this.updateLines();
	}
	
	spawnPiece() {
		const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
		const typeIndex = this.pieceTypes.indexOf(type) + 1;
		this.currentPiece = {
			shape: JSON.parse(JSON.stringify(this.pieces[type])),
			color: typeIndex
		};
		this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
		this.currentY = 0;
		
		if (this.checkCollision(this.currentX, this.currentY, this.currentPiece.shape)) {
			this.gameOver();
		}
	}
	
	checkCollision(x, y, shape) {
		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				if (shape[row][col]) {
					const newX = x + col;
					const newY = y + row;
					
					if (newX < 0 || newX >= this.cols || newY >= this.rows) {
						return true;
					}
					
					if (newY >= 0 && this.board[newY][newX]) {
						return true;
					}
				}
			}
		}
		return false;
	}
	
	mergePiece() {
		for (let row = 0; row < this.currentPiece.shape.length; row++) {
			for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
				if (this.currentPiece.shape[row][col]) {
					const y = this.currentY + row;
					const x = this.currentX + col;
					if (y >= 0) {
						this.board[y][x] = this.currentPiece.color;
					}
				}
			}
		}
	}
	
	clearLines() {
		let linesCleared = 0;
		
		for (let row = this.rows - 1; row >= 0; row--) {
			if (this.board[row].every(cell => cell !== 0)) {
				this.board.splice(row, 1);
				this.board.unshift(Array(this.cols).fill(0));
				linesCleared++;
				row++;
			}
		}
		
		if (linesCleared > 0) {
			this.lines += linesCleared;
			this.updateLines();
			
			const points = [0, 100, 300, 500, 800];
			this.score += points[linesCleared];
			this.updateScore();
			
			const newLevel = Math.floor(this.lines / 10) + 1;
			if (newLevel > this.level) {
				this.level = newLevel;
				this.updateLevel();
				this.dropInterval = Math.max(100, 500 - (this.level - 1) * 50);
				this.restartGameLoop();
			}
		}
	}
	
	moveLeft() {
		if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece.shape)) {
			this.currentX--;
			this.draw();
		}
	}
	
	moveRight() {
		if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece.shape)) {
			this.currentX++;
			this.draw();
		}
	}
	
	moveDown() {
		if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
			this.currentY++;
			this.draw();
			return true;
		} else {
			this.mergePiece();
			this.clearLines();
			this.spawnPiece();
			this.draw();
			return false;
		}
	}
	
	hardDrop() {
		while (this.moveDown()) {}
	}
	
	rotate() {
		const rotated = this.currentPiece.shape[0].map((_, i) =>
			this.currentPiece.shape.map(row => row[i]).reverse()
		);
		
		if (!this.checkCollision(this.currentX, this.currentY, rotated)) {
			this.currentPiece.shape = rotated;
			this.draw();
		}
	}
	
	draw() {
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				if (this.board[row][col]) {
					this.ctx.fillStyle = this.colors[this.board[row][col]];
					this.ctx.fillRect(
						col * this.cellSize + 1,
						row * this.cellSize + 1,
						this.cellSize - 2,
						this.cellSize - 2
					);
				}
			}
		}
		
		if (this.currentPiece) {
			this.ctx.fillStyle = this.colors[this.currentPiece.color];
			for (let row = 0; row < this.currentPiece.shape.length; row++) {
				for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
					if (this.currentPiece.shape[row][col]) {
						const x = this.currentX + col;
						const y = this.currentY + row;
						if (y >= 0) {
							this.ctx.fillRect(
								x * this.cellSize + 1,
								y * this.cellSize + 1,
								this.cellSize - 2,
								this.cellSize - 2
							);
						}
					}
				}
			}
		}
		
		this.ctx.strokeStyle = '#333';
		for (let row = 0; row <= this.rows; row++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, row * this.cellSize);
			this.ctx.lineTo(this.cols * this.cellSize, row * this.cellSize);
			this.ctx.stroke();
		}
		for (let col = 0; col <= this.cols; col++) {
			this.ctx.beginPath();
			this.ctx.moveTo(col * this.cellSize, 0);
			this.ctx.lineTo(col * this.cellSize, this.rows * this.cellSize);
			this.ctx.stroke();
		}
	}
	
	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.reset();
		this.onStateChange({ state: 'start', buttonText: 'Pause' });
		this.gameLoop = setInterval(() => this.update(), this.dropInterval);
		this.draw();
	}
	
	pause() {
		if (!this.isRunning || this.isPaused) return;
		this.isPaused = true;
		clearInterval(this.gameLoop);
		this.onStateChange({ state: 'pause', buttonText: 'Resume' });
	}
	
	resume() {
		if (!this.isRunning || !this.isPaused) return;
		this.isPaused = false;
		this.onStateChange({ state: 'resume', buttonText: 'Pause' });
		this.gameLoop = setInterval(() => this.update(), this.dropInterval);
	}
	
	restartGameLoop() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
		}
		if (this.isRunning && !this.isPaused) {
			this.gameLoop = setInterval(() => this.update(), this.dropInterval);
		}
	}
	
	update() {
		this.moveDown();
	}
	
	gameOver() {
		this.isRunning = false;
		this.isPaused = false;
		clearInterval(this.gameLoop);
		
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem('tetrisHighScore', this.highScore);
			this.updateHighScore();
		}
		
		this.onStateChange({ 
			state: 'gameOver', 
			buttonText: 'Start',
			score: this.score,
			highScore: this.highScore
		});
		
		if (this.finalScoreElement) {
			this.finalScoreElement.textContent = this.score;
		}
		if (this.gameOverHighScoreElement) {
			this.gameOverHighScoreElement.textContent = this.highScore;
		}
		if (this.gameOverPanel) {
			this.gameOverPanel.style.display = 'flex';
		}
	}
	
	updateScore() {
		if (this.scoreElement) {
			this.scoreElement.textContent = this.score;
		}
	}
	
	updateLevel() {
		if (this.levelElement) {
			this.levelElement.textContent = this.level;
		}
	}
	
	updateLines() {
		if (this.linesElement) {
			this.linesElement.textContent = this.lines;
		}
	}
	
	updateHighScore() {
		if (this.highScoreElement) {
			this.highScoreElement.textContent = this.highScore;
		}
	}
	
	destroy() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
		}
	}
}

if (typeof window !== 'undefined') {
	window.Tetris = Tetris;
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Tetris;
}
