(function() {
	let currentMode = null;
	let sharedLoaded = false;
	let desktopScriptLoaded = false;
	let mobileScriptLoaded = false;
	let tabletScriptLoaded = false;
	
	const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
	const tabletMediaQuery = window.matchMedia('(min-width: 769px) and (max-width: 1180px)');
	const desktopMediaQuery = window.matchMedia('(min-width: 1181px)');

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
		const isDarkTheme = document.body.classList.contains('dark-theme');
		currentMode = 'mobile';
		document.body.className = 'mobile-mode';
		if (isDarkTheme) {
			document.body.classList.add('dark-theme');
		}
		
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

	function switchToTablet() {
		if (currentMode === 'tablet') return;
		
		console.log('[Responsive] Switching to tablet mode');
		const isDarkTheme = document.body.classList.contains('dark-theme');
		currentMode = 'tablet';
		document.body.className = 'tablet-mode';
		if (isDarkTheme) {
			document.body.classList.add('dark-theme');
		}
		
		const desktopWindows = document.querySelectorAll('.window');
		desktopWindows.forEach(function(win) {
			win.style.display = 'none';
		});
		
		loadSharedModules(function() {
			if (!tabletScriptLoaded) {
				loadScript('js/tablet-ui.js', function() {
					loadScript('js/os-tablet.js', function() {
						tabletScriptLoaded = true;
						if (window.initTabletOS) {
							window.initTabletOS();
						}
						if (window.initTabletUI) {
							window.initTabletUI();
						}
					});
				});
			} else {
				if (window.initTabletOS) {
					window.initTabletOS();
				}
				if (window.initTabletUI) {
					window.initTabletUI();
				}
			}
		});
	}

	function switchToDesktop() {
		if (currentMode === 'desktop') return;
		
		console.log('[Responsive] Switching to desktop mode');
		const isDarkTheme = document.body.classList.contains('dark-theme');
		currentMode = 'desktop';
		document.body.className = 'desktop-mode os-desktop';
		if (isDarkTheme) {
			document.body.classList.add('dark-theme');
		}
		
		const mobileAppViews = document.querySelectorAll('.mobile-app-view');
		mobileAppViews.forEach(function(view) {
			view.classList.remove('active');
		});
		const mobileHomeScreen = document.getElementById('mobile-home-screen');
		if (mobileHomeScreen) {
			mobileHomeScreen.style.display = 'flex';
		}
		
		const tabletAppViews = document.querySelectorAll('.tablet-app-view');
		tabletAppViews.forEach(function(view) {
			view.classList.remove('active');
		});
		const tabletHomeScreen = document.getElementById('tablet-home-screen');
		if (tabletHomeScreen) {
			tabletHomeScreen.style.display = 'flex';
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
		console.log('[Responsive] Checking device - Mobile:', mobileMediaQuery.matches, 'Tablet:', tabletMediaQuery.matches, 'Desktop:', desktopMediaQuery.matches, 'Current mode:', currentMode);
		
		if (mobileMediaQuery.matches) {
			console.log('[Responsive] Switch to mobile (viewport <= 768px)');
			switchToMobile();
		} else if (tabletMediaQuery.matches) {
			console.log('[Responsive] Switch to tablet (viewport 769-1180px)');
			switchToTablet();
		} else {
			console.log('[Responsive] Switch to desktop (viewport > 1180px)');
			switchToDesktop();
		}
	}

	mobileMediaQuery.addListener(checkDeviceAndSwitch);
	tabletMediaQuery.addListener(checkDeviceAndSwitch);
	desktopMediaQuery.addListener(checkDeviceAndSwitch);

	checkDeviceAndSwitch();
})();
