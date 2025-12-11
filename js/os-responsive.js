(function() {
	let currentMode = null;
	let sharedLoaded = false;
	let desktopScriptLoaded = false;
	let mobileScriptLoaded = false;
	const MOBILE_BREAKPOINT = 768;
	const DESKTOP_BREAKPOINT = 992;

	function isMobileDevice() {
		const width = window.innerWidth;
		return width <= MOBILE_BREAKPOINT;
	}

	function isDesktopDevice() {
		const width = window.innerWidth;
		return width >= DESKTOP_BREAKPOINT;
	}

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
		
		// Force hide desktop wrapper
		const desktopWrapper = document.querySelector('.desktop-wrapper');
		console.log('[Responsive] Desktop wrapper:', desktopWrapper);
		if (desktopWrapper) {
			desktopWrapper.style.display = 'none';
			console.log('[Responsive] Desktop wrapper hidden');
		}
		
		// Force show mobile wrapper
		const mobileWrapper = document.querySelector('.mobile-wrapper');
		console.log('[Responsive] Mobile wrapper:', mobileWrapper);
		if (mobileWrapper) {
			mobileWrapper.style.display = 'block';
			console.log('[Responsive] Mobile wrapper shown');
		}
		
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
		
		currentMode = 'desktop';
		document.body.className = 'desktop-mode os-desktop';
		
		// Force show desktop wrapper
		const desktopWrapper = document.querySelector('.desktop-wrapper');
		if (desktopWrapper) {
			desktopWrapper.style.display = 'block';
		}
		
		// Force hide mobile wrapper
		const mobileWrapper = document.querySelector('.mobile-wrapper');
		if (mobileWrapper) {
			mobileWrapper.style.display = 'none';
		}
		
		// Hide all mobile app views to prevent inline styles from overriding CSS
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
		const width = window.innerWidth;
		console.log('[Responsive] Window width: ' + width + ', Current mode: ' + currentMode);
		
		if (isMobileDevice()) {
			console.log('[Responsive] Should switch to mobile (width <= 768)');
			switchToMobile();
		} else if (isDesktopDevice()) {
			console.log('[Responsive] Should switch to desktop (width >= 992)');
			switchToDesktop();
		} else {
			console.log('[Responsive] Default to desktop (768 < width < 992)');
			switchToDesktop();
		}
	}

	let resizeTimer;
	window.addEventListener('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			checkDeviceAndSwitch();
		}, 250);
	});

	checkDeviceAndSwitch();
})();
