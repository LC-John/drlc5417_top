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
    let dynamicWindowCounter = 0;
    let lastActiveElement = null;

    setInterval(function() {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'IFRAME' && activeElement !== lastActiveElement) {
            const $window = $(activeElement).closest('.window');
            if ($window.length > 0) {
                bringToFront($window);
            }
            lastActiveElement = activeElement;
        } else if (activeElement && activeElement.tagName !== 'IFRAME') {
            lastActiveElement = null;
        }
    }, 100);

    window.DesktopWindowManager = {
        openPdfWindow: function(title, pdfUrl) {
            const windowId = 'pdf-' + (++dynamicWindowCounter);
            const shortTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
            
            const $window = $('<div>')
                .addClass('window dynamic-window')
                .attr('id', 'window-' + windowId)
                .css({
                    top: (100 + dynamicWindowCounter * 30) + 'px',
                    left: (200 + dynamicWindowCounter * 30) + 'px',
                    width: '800px',
                    height: '600px',
                    display: 'block',
                    zIndex: ++zIndexCounter
                });
            
            const titlebar = `
                <div class="window-titlebar">
                    <div class="window-title">
                        <span>📄</span>
                        <span>${shortTitle}</span>
                    </div>
                    <div class="window-controls">
                        <div class="window-btn minimize-btn">_</div>
                        <div class="window-btn maximize-btn">□</div>
                        <div class="window-btn close-btn">×</div>
                    </div>
                </div>
            `;
            
            const content = `
                <div class="window-content" style="padding: 0; overflow: hidden;">
                    <iframe src="${pdfUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
                </div>
            `;
            
            const resizeHandles = `
                <div class="resize-handle resize-right"></div>
                <div class="resize-handle resize-bottom"></div>
                <div class="resize-handle resize-corner"></div>
            `;
            
            $window.html(titlebar + content + resizeHandles);
            $('.desktop').append($window);
            
            createTaskbarButton(windowId, shortTitle);
            bringToFront($window);
            
            attachDynamicWindowEvents($window);
        }
    };
    
    function attachDynamicWindowEvents($window) {
        $window.on('mousedown', function() {
            bringToFront($(this));
        });
        
        $window.find('.window-titlebar').on('mousedown', function(e) {
            if ($(e.target).hasClass('window-btn') || $(e.target).parent().hasClass('window-btn')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            draggedWindow = $(this).closest('.window');
            
            if (draggedWindow.hasClass('maximized')) {
                return;
            }
            
            const offset = draggedWindow.offset();
            dragOffset.x = e.pageX - offset.left;
            dragOffset.y = e.pageY - offset.top;
            
            draggedWindow.css('cursor', 'move');
            $('body').css('cursor', 'move');
            draggedWindow.find('iframe').css('pointer-events', 'none');
        });
        
        $window.find('.resize-handle').on('mousedown', function(e) {
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
            
            resizingWindow.find('iframe').css('pointer-events', 'none');
            
            if ($(this).hasClass('resize-right')) {
                resizeType = 'right';
            } else if ($(this).hasClass('resize-bottom')) {
                resizeType = 'bottom';
            } else if ($(this).hasClass('resize-corner')) {
                resizeType = 'corner';
            }
        });
        
        $window.find('.close-btn').on('click', function(e) {
            e.stopPropagation();
            const $win = $(this).closest('.window');
            closeDynamicWindow($win);
        });
        
        $window.find('.minimize-btn').on('click', function(e) {
            e.stopPropagation();
            const $win = $(this).closest('.window');
            minimizeWindow($win);
        });
        
        $window.find('.maximize-btn').on('click', function(e) {
            e.stopPropagation();
            const $win = $(this).closest('.window');
            toggleMaximize($win);
        });
    }
    
    function closeDynamicWindow($window) {
        const windowId = $window.attr('id').replace('window-', '');
        $window.remove();
        removeTaskbarButton(windowId);
        $('.window').removeClass('active');
    }

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
        
        e.preventDefault();
        e.stopPropagation();
        
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
        } else if (draggedWindow) {
            const newLeft = e.pageX - dragOffset.x;
            const newTop = e.pageY - dragOffset.y;
            draggedWindow.css({
                left: newLeft + 'px',
                top: newTop + 'px'
            });
        } else if (draggedIcon) {
            const distance = Math.abs(e.pageX - dragStartPos.x) + Math.abs(e.pageY - dragStartPos.y);
            if (distance > 5) {
                isDragging = true;
                const newLeft = e.pageX - dragOffset.x;
                const newTop = e.pageY - dragOffset.y;
                draggedIcon.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
            }
        }
    });

    $(document).on('mouseup', function() {
        draggedIcon = null;
        isDragging = false;
        
        if (draggedWindow) {
            draggedWindow.css('cursor', 'default');
            $('body').css('cursor', 'default');
            draggedWindow.find('iframe').css('pointer-events', 'auto');
            draggedWindow = null;
        }
        
        if (resizingWindow) {
            resizingWindow.find('iframe').css('pointer-events', 'auto');
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

    showWindow('about');
});
