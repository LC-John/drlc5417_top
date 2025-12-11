class Snake {
	constructor(config) {
		this.canvas = config.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.gridSize = config.gridSize || 20;
		this.tileCount = config.tileCount || 20;
		
		this.scoreElement = config.scoreElement;
		this.highScoreElement = config.highScoreElement;
		this.startButton = config.startButton;
		this.restartButton = config.restartButton;
		this.gameOverPanel = config.gameOverPanel;
		this.finalScoreElement = config.finalScoreElement;
		this.gameOverHighScoreElement = config.gameOverHighScoreElement;
		
		this.controlButtons = config.controlButtons || {};
		
		this.onStateChange = config.onStateChange || (() => {});
		
		this.snake = [];
		this.food = {};
		this.dx = 0;
		this.dy = 0;
		this.score = 0;
		this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
		this.gameLoop = null;
		this.isRunning = false;
		
		this.bindEvents();
		this.updateHighScore();
	}
	
	bindEvents() {
		if (this.startButton) {
			this.startButton.addEventListener('click', () => {
				if (!this.isRunning) {
					if (this.startButton.textContent.includes('Resume')) {
						this.resume();
					} else {
						this.start();
					}
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
		
		if (this.controlButtons.up) {
			this.controlButtons.up.addEventListener('click', () => this.changeDirection(0, -1));
		}
		if (this.controlButtons.down) {
			this.controlButtons.down.addEventListener('click', () => this.changeDirection(0, 1));
		}
		if (this.controlButtons.left) {
			this.controlButtons.left.addEventListener('click', () => this.changeDirection(-1, 0));
		}
		if (this.controlButtons.right) {
			this.controlButtons.right.addEventListener('click', () => this.changeDirection(1, 0));
		}
		
		document.addEventListener('keydown', (e) => {
			if (!this.isRunning) return;
			
			switch(e.key) {
				case 'ArrowUp':
				case 'w':
				case 'W':
					e.preventDefault();
					this.changeDirection(0, -1);
					break;
				case 'ArrowDown':
				case 's':
				case 'S':
					e.preventDefault();
					this.changeDirection(0, 1);
					break;
				case 'ArrowLeft':
				case 'a':
				case 'A':
					e.preventDefault();
					this.changeDirection(-1, 0);
					break;
				case 'ArrowRight':
				case 'd':
				case 'D':
					e.preventDefault();
					this.changeDirection(1, 0);
					break;
			}
		});
	}
	
	reset() {
		this.snake = [
			{ x: 10, y: 10 },
			{ x: 9, y: 10 },
			{ x: 8, y: 10 }
		];
		this.dx = 1;
		this.dy = 0;
		this.score = 0;
		this.spawnFood();
		this.updateScore();
	}
	
	spawnFood() {
		do {
			this.food = {
				x: Math.floor(Math.random() * this.tileCount),
				y: Math.floor(Math.random() * this.tileCount)
			};
		} while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
	}
	
	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.reset();
		this.onStateChange({ state: 'start', buttonText: 'Pause' });
		this.gameLoop = setInterval(() => this.update(), 100);
	}
	
	pause() {
		this.isRunning = false;
		clearInterval(this.gameLoop);
		this.onStateChange({ state: 'pause', buttonText: 'Resume' });
	}
	
	resume() {
		this.isRunning = true;
		this.onStateChange({ state: 'resume', buttonText: 'Pause' });
		this.gameLoop = setInterval(() => this.update(), 100);
	}
	
	update() {
		const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
		
		if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
			this.gameOver();
			return;
		}
		
		if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
			this.gameOver();
			return;
		}
		
		this.snake.unshift(head);
		
		if (head.x === this.food.x && head.y === this.food.y) {
			this.score++;
			this.updateScore();
			this.spawnFood();
		} else {
			this.snake.pop();
		}
		
		this.draw();
	}
	
	draw() {
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.ctx.fillStyle = '#0f0';
		this.snake.forEach(segment => {
			this.ctx.fillRect(
				segment.x * this.gridSize,
				segment.y * this.gridSize,
				this.gridSize - 2,
				this.gridSize - 2
			);
		});
		
		this.ctx.fillStyle = '#f00';
		this.ctx.fillRect(
			this.food.x * this.gridSize,
			this.food.y * this.gridSize,
			this.gridSize - 2,
			this.gridSize - 2
		);
	}
	
	gameOver() {
		this.isRunning = false;
		clearInterval(this.gameLoop);
		
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem('snakeHighScore', this.highScore);
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
	
	updateHighScore() {
		if (this.highScoreElement) {
			this.highScoreElement.textContent = this.highScore;
		}
	}
	
	changeDirection(newDx, newDy) {
		if (this.dx === -newDx && this.dy === -newDy) return;
		this.dx = newDx;
		this.dy = newDy;
	}
	
	destroy() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
		}
	}
}

if (typeof window !== 'undefined') {
	window.Snake = Snake;
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Snake;
}
