(function() {
	let currentMode = null;
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

	function switchToMobile() {
		if (currentMode === 'mobile') return;
		
		currentMode = 'mobile';
		document.body.className = 'mobile-mode';
		
		if (!mobileScriptLoaded) {
			loadScript('js/os-mobile.js', function() {
				mobileScriptLoaded = true;
				if (window.initMobileOS) {
					window.initMobileOS();
				}
			});
		} else {
			if (window.initMobileOS) {
				window.initMobileOS();
			}
		}
	}

	function switchToDesktop() {
		if (currentMode === 'desktop') return;
		
		currentMode = 'desktop';
		document.body.className = 'desktop-mode os-desktop';
		
		if (!desktopScriptLoaded) {
			loadScript('js/os-desktop.js', function() {
				desktopScriptLoaded = true;
			});
		}
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
