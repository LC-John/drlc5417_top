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
		
		currentMode = 'mobile';
		document.body.className = 'mobile-mode';
		
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
		if (isMobileDevice()) {
			switchToMobile();
		} else if (isDesktopDevice()) {
			switchToDesktop();
		} else {
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
