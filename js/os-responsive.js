(function() {
	let currentMode = null;
	let sharedLoaded = false;
	let desktopScriptLoaded = false;
	let mobileScriptLoaded = false;
	
	// Use matchMedia for more reliable viewport detection
	const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

	function loadScript(src, callback) {
		const script = document.createElement('script');
		script.src = src;
		script.onload = callback;
		script.onerror = function() {
			console.error('Failed to load script:', src);
		};
		document.body.appendChild(script);
	}

	function loadSharedModules(callback) {
		if (sharedLoaded) {
			callback();
			return;
		}
		
		loadScript('js/shared/content-data.js', function() {
			loadScript('js/games/minesweeper.js', function() {
				loadScript('js/games/snake.js', function() {
					sharedLoaded = true;
					callback();
				});
			});
		});
	}

	function switchToMobile() {
		if (currentMode === 'mobile') return;
		
		console.log('[Responsive] Switching to mobile mode');
		currentMode = 'mobile';
		document.body.className = 'mobile-mode';
		
		// Hide all desktop windows to prevent inline styles from overriding CSS
		const desktopWindows = document.querySelectorAll('.window');
		desktopWindows.forEach(function(win) {
			win.style.display = 'none';
		});
		
		loadSharedModules(function() {
			if (!mobileScriptLoaded) {
				loadScript('js/mobile-ui.js', function() {
					loadScript('js/os-mobile.js', function() {
						mobileScriptLoaded = true;
						if (window.initMobileOS) {
							window.initMobileOS();
						}
						if (window.initMobileUI) {
							window.initMobileUI();
						}
					});
				});
			} else {
				if (window.initMobileOS) {
					window.initMobileOS();
				}
				if (window.initMobileUI) {
					window.initMobileUI();
				}
			}
		});
	}

	function switchToDesktop() {
		if (currentMode === 'desktop') return;
		
		console.log('[Responsive] Switching to desktop mode');
		currentMode = 'desktop';
		document.body.className = 'desktop-mode os-desktop';
		
		// Hide all mobile app views
		const mobileAppViews = document.querySelectorAll('.mobile-app-view');
		mobileAppViews.forEach(function(view) {
			view.classList.remove('active');
		});
		const mobileHomeScreen = document.getElementById('mobile-home-screen');
		if (mobileHomeScreen) {
			mobileHomeScreen.style.display = 'flex';
		}
		
		loadSharedModules(function() {
			if (!desktopScriptLoaded) {
				loadScript('js/desktop-ui.js', function() {
					loadScript('js/os-desktop.js', function() {
						desktopScriptLoaded = true;
						if (window.initDesktopUI) {
							window.initDesktopUI();
						}
					});
				});
			} else {
				if (window.initDesktopUI) {
					window.initDesktopUI();
				}
			}
		});
	}

	function checkDeviceAndSwitch() {
		console.log('[Responsive] Media query matches:', mobileMediaQuery.matches, 'Current mode:', currentMode);
		
		if (mobileMediaQuery.matches) {
			console.log('[Responsive] Switch to mobile (viewport <= 768px)');
			switchToMobile();
		} else {
			console.log('[Responsive] Switch to desktop (viewport > 768px)');
			switchToDesktop();
		}
	}

	// Listen to media query changes
	mobileMediaQuery.addListener(function(e) {
		console.log('[Responsive] Media query changed, matches:', e.matches);
		checkDeviceAndSwitch();
	});

	// Initial check
	checkDeviceAndSwitch();
})();
