$(document).ready(function() {
    let zIndexCounter = 100;
    let draggedWindow = null;
    let draggedIcon = null;
    let dragOffset = { x: 0, y: 0 };
    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };
    let resizingWindow = null;
    let resizeType = null;
    let resizeStartPos = { x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 };

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        $('#taskbar-time').text(`${hours}:${minutes}`);
    }

    updateTime();
    setInterval(updateTime, 60000);

    function createTaskbarButton(windowId, title) {
        if ($(`#taskbar-btn-${windowId}`).length > 0) {
            return;
        }
        
        const $button = $('<div>')
            .addClass('taskbar-btn')
            .attr('id', `taskbar-btn-${windowId}`)
            .attr('data-window', windowId)
            .text(title);
        
        $('.taskbar-tasks').append($button);
    }

    function removeTaskbarButton(windowId) {
        $(`#taskbar-btn-${windowId}`).remove();
    }

    function showWindow(windowId) {
        const $window = $(`#window-${windowId}`);
        const title = $window.find('.window-title span:last').text();
        
        createTaskbarButton(windowId, title);
        $window.show();
        bringToFront($window);
    }

    function minimizeWindow($window) {
        const windowId = $window.attr('id').replace('window-', '');
        $window.hide();
        $('.window').removeClass('active');
        $('.taskbar-btn').removeClass('active');
    }

    function closeWindow($window) {
        const windowId = $window.attr('id').replace('window-', '');
        $window.hide();
        removeTaskbarButton(windowId);
        $('.window').removeClass('active');
    }

    $(document).on('click', '.taskbar-btn', function() {
        const windowId = $(this).data('window');
        const $window = $(`#window-${windowId}`);
        
        if ($window.is(':visible') && $window.hasClass('active')) {
            minimizeWindow($window);
        } else {
            $window.show();
            bringToFront($window);
        }
    });

    $('.desktop-icon').on('mousedown', function(e) {
        e.preventDefault();
        draggedIcon = $(this);
        isDragging = false;
        dragStartPos.x = e.pageX;
        dragStartPos.y = e.pageY;
        
        const offset = draggedIcon.offset();
        dragOffset.x = e.pageX - offset.left;
        dragOffset.y = e.pageY - offset.top;
        
        $('.desktop-icon').removeClass('selected');
        $(this).addClass('selected');
    });

    $('.desktop-icon').on('dblclick', function(e) {
        e.preventDefault();
        const windowId = $(this).data('window');
        showWindow(windowId);
    });

    $('.close-btn').on('click', function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window');
        closeWindow($window);
    });

    $('.minimize-btn').on('click', function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window');
        minimizeWindow($window);
    });

    $('.maximize-btn').on('click', function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window');
        toggleMaximize($window);
    });

    function toggleMaximize($window) {
        if ($window.hasClass('maximized')) {
            const savedState = $window.data('savedState');
            $window.css({
                top: savedState.top + 'px',
                left: savedState.left + 'px',
                width: savedState.width + 'px',
                height: savedState.height + 'px'
            });
            $window.removeClass('maximized');
            $window.find('.resize-handle').show();
        } else {
            const currentState = {
                top: parseInt($window.css('top')),
                left: parseInt($window.css('left')),
                width: $window.width(),
                height: $window.height()
            };
            $window.data('savedState', currentState);
            
            const maxHeight = $(window).height() - 32;
            $window.css({
                top: '0px',
                left: '0px',
                width: '100%',
                height: maxHeight + 'px'
            });
            $window.addClass('maximized');
            $window.find('.resize-handle').hide();
        }
    }

    $('.window').on('mousedown', function() {
        bringToFront($(this));
    });

    $('.window-titlebar').on('mousedown', function(e) {
        if ($(e.target).hasClass('window-btn') || $(e.target).parent().hasClass('window-btn')) {
            return;
        }
        
        draggedWindow = $(this).closest('.window');
        
        if (draggedWindow.hasClass('maximized')) {
            return;
        }
        
        const offset = draggedWindow.offset();
        dragOffset.x = e.pageX - offset.left;
        dragOffset.y = e.pageY - offset.top;
        
        draggedWindow.css('cursor', 'move');
        $('body').css('cursor', 'move');
    });

    $('.resize-handle').on('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        resizingWindow = $(this).closest('.window');
        const offset = resizingWindow.offset();
        
        resizeStartPos.x = e.pageX;
        resizeStartPos.y = e.pageY;
        resizeStartPos.width = resizingWindow.width();
        resizeStartPos.height = resizingWindow.height();
        resizeStartPos.left = offset.left;
        resizeStartPos.top = offset.top;
        
        if ($(this).hasClass('resize-right')) {
            resizeType = 'right';
        } else if ($(this).hasClass('resize-bottom')) {
            resizeType = 'bottom';
        } else if ($(this).hasClass('resize-corner')) {
            resizeType = 'corner';
        }
    });

    $(document).on('mousemove', function(e) {
        if (resizingWindow) {
            const deltaX = e.pageX - resizeStartPos.x;
            const deltaY = e.pageY - resizeStartPos.y;
            const minWidth = parseInt(resizingWindow.css('min-width')) || 300;
            const minHeight = parseInt(resizingWindow.css('min-height')) || 200;
            
            if (resizeType === 'right') {
                const newWidth = Math.max(minWidth, resizeStartPos.width + deltaX);
                resizingWindow.css('width', newWidth + 'px');
            } else if (resizeType === 'bottom') {
                const newHeight = Math.max(minHeight, resizeStartPos.height + deltaY);
                resizingWindow.css('height', newHeight + 'px');
            } else if (resizeType === 'corner') {
                const newWidth = Math.max(minWidth, resizeStartPos.width + deltaX);
                const newHeight = Math.max(minHeight, resizeStartPos.height + deltaY);
                resizingWindow.css({
                    width: newWidth + 'px',
                    height: newHeight + 'px'
                });
            }
        } else if (draggedIcon) {
            const deltaX = Math.abs(e.pageX - dragStartPos.x);
            const deltaY = Math.abs(e.pageY - dragStartPos.y);
            
            if (deltaX > 5 || deltaY > 5) {
                isDragging = true;
            }
            
            if (isDragging) {
                const newLeft = e.pageX - dragOffset.x;
                const newTop = e.pageY - dragOffset.y;
                
                const maxLeft = $(window).width() - draggedIcon.width() - 20;
                const maxTop = $(window).height() - draggedIcon.height() - 60;
                
                draggedIcon.css({
                    left: Math.max(0, Math.min(newLeft, maxLeft)) + 'px',
                    top: Math.max(0, Math.min(newTop, maxTop)) + 'px'
                });
            }
        } else if (draggedWindow) {
            const newLeft = e.pageX - dragOffset.x;
            const newTop = e.pageY - dragOffset.y;
            
            const maxLeft = $(window).width() - draggedWindow.width();
            const maxTop = $(window).height() - draggedWindow.height() - 30;
            
            draggedWindow.css({
                left: Math.max(0, Math.min(newLeft, maxLeft)) + 'px',
                top: Math.max(0, Math.min(newTop, maxTop)) + 'px'
            });
        }
    });

    $(document).on('mouseup', function() {
        draggedIcon = null;
        isDragging = false;
        
        if (draggedWindow) {
            draggedWindow.css('cursor', 'default');
            $('body').css('cursor', 'default');
            draggedWindow = null;
        }
        
        if (resizingWindow) {
            resizingWindow = null;
            resizeType = null;
        }
    });

    function bringToFront($window) {
        $('.window').removeClass('active');
        $('.taskbar-btn').removeClass('active');
        $window.addClass('active');
        
        const windowId = $window.attr('id').replace('window-', '');
        $(`#taskbar-btn-${windowId}`).addClass('active');
        
        zIndexCounter++;
        $window.css('z-index', zIndexCounter);
    }

    $('.desktop').on('click', function(e) {
        if ($(e.target).hasClass('desktop') || $(e.target).hasClass('desktop-icons')) {
            $('.desktop-icon').removeClass('selected');
            $('#start-menu').removeClass('show');
        }
    });

    $('.start-button').on('click', function(e) {
        e.stopPropagation();
        $('#start-menu').toggleClass('show');
    });

    $('#start-menu').on('click', function(e) {
        e.stopPropagation();
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.start-button').length && !$(e.target).closest('#start-menu').length) {
            $('#start-menu').removeClass('show');
        }
    });

    $('#theme-toggle').on('click', function() {
        $('body').toggleClass('dark-mode');
        
        if ($('body').hasClass('dark-mode')) {
            $('#theme-toggle-text').text('Light Mode');
            $(this).find('span:first-child').text('☀️');
        } else {
            $('#theme-toggle-text').text('Dark Mode');
            $(this).find('span:first-child').text('🌙');
        }
        
        $('#start-menu').removeClass('show');
    });

    const minesweeper = {
        rows: 10,
        cols: 10,
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
            $('#reset-btn').text('🙂');
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
            const $board = $('#minesweeper-board');
            $board.empty();
            $board.css('grid-template-columns', `repeat(${this.cols}, 30px)`);
            
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const $cell = $('<div>')
                        .addClass('mine-cell')
                        .attr('data-row', r)
                        .attr('data-col', c);
                    
                    if (this.revealed[r][c]) {
                        $cell.addClass('revealed');
                        if (this.board[r][c] === -1) {
                            $cell.addClass('mine');
                        } else if (this.board[r][c] > 0) {
                            $cell.text(this.board[r][c]);
                            $cell.addClass(`num-${this.board[r][c]}`);
                        }
                    } else if (this.flagged[r][c]) {
                        $cell.addClass('flagged');
                    }
                    
                    $board.append($cell);
                }
            }
        },

        reveal(row, col) {
            if (this.gameOver || this.revealed[row][col] || this.flagged[row][col]) return;
            
            if (this.firstClick) {
                this.placeMines(row, col);
                this.firstClick = false;
                this.startTimer();
            }
            
            this.revealed[row][col] = true;
            
            if (this.board[row][col] === -1) {
                this.gameOver = true;
                this.revealAll();
                $('#reset-btn').text('😵');
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
        },

        toggleFlag(row, col) {
            if (this.gameOver || this.revealed[row][col]) return;
            
            this.flagged[row][col] = !this.flagged[row][col];
            this.renderBoard();
            this.updateMinesCounter();
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
            let revealedCount = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.revealed[r][c]) revealedCount++;
                }
            }
            
            if (revealedCount === this.rows * this.cols - this.mines) {
                this.gameOver = true;
                $('#reset-btn').text('😎');
                if (this.timer) clearInterval(this.timer);
            }
        },

        updateMinesCounter() {
            let flagCount = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.flagged[r][c]) flagCount++;
                }
            }
            const remaining = this.mines - flagCount;
            $('#mines-counter').text(String(remaining).padStart(3, '0'));
        },

        startTimer() {
            this.timer = setInterval(() => {
                this.seconds++;
                this.updateTimer();
            }, 1000);
        },

        updateTimer() {
            $('#timer').text(String(Math.min(this.seconds, 999)).padStart(3, '0'));
        }
    };

    $('#reset-btn').on('click', function() {
        minesweeper.init();
    });

    $(document).on('click', '.mine-cell', function() {
        const row = parseInt($(this).attr('data-row'));
        const col = parseInt($(this).attr('data-col'));
        minesweeper.reveal(row, col);
    });

    $(document).on('contextmenu', '.mine-cell', function(e) {
        e.preventDefault();
        const row = parseInt($(this).attr('data-row'));
        const col = parseInt($(this).attr('data-col'));
        minesweeper.toggleFlag(row, col);
    });

    minesweeper.init();

    const snake = {
        canvas: null,
        ctx: null,
        gridSize: 20,
        tileCount: 20,
        snake: [],
        food: {},
        dx: 0,
        dy: 0,
        score: 0,
        highScore: 0,
        gameLoop: null,
        isRunning: false,

        init() {
            this.canvas = document.getElementById('snake-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.reset();
        },

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
        },

        spawnFood() {
            do {
                this.food = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount)
                };
            } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
        },

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.reset();
            $('#snake-start-btn').text('Pause');
            this.gameLoop = setInterval(() => this.update(), 100);
        },

        pause() {
            this.isRunning = false;
            clearInterval(this.gameLoop);
            $('#snake-start-btn').text('Resume');
        },

        resume() {
            this.isRunning = true;
            $('#snake-start-btn').text('Pause');
            this.gameLoop = setInterval(() => this.update(), 100);
        },

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
        },

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
        },

        gameOver() {
            this.isRunning = false;
            clearInterval(this.gameLoop);
            if (this.score > this.highScore) {
                this.highScore = this.score;
                $('#snake-high-score').text(this.highScore);
            }
            $('#snake-start-btn').text('Start');
            $('#final-score').text(this.score);
            $('#game-over-high-score').text(this.highScore);
            $('#snake-game-over').show();
        },

        updateScore() {
            $('#snake-score').text(this.score);
        },

        changeDirection(newDx, newDy) {
            if (this.dx === -newDx && this.dy === -newDy) return;
            this.dx = newDx;
            this.dy = newDy;
        }
    };

    snake.init();

    $('#snake-start-btn').on('click', function() {
        if (!snake.isRunning) {
            if ($(this).text() === 'Resume') {
                snake.resume();
            } else {
                snake.start();
            }
        } else {
            snake.pause();
        }
    });

    $('#snake-restart-btn').on('click', function() {
        $('#snake-game-over').hide();
        snake.start();
    });

    $(document).on('keydown', function(e) {
        if (!snake.isRunning) return;

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                snake.changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                snake.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                snake.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                snake.changeDirection(1, 0);
                break;
        }
    });

    showWindow('about');
});
