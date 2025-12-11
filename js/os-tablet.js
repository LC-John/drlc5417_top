function initTabletOS() {
	if (window.tabletOSInitialized) return;
	window.tabletOSInitialized = true;

	function updateTime() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const tabletTimeEl = document.getElementById('tablet-time');
		if (tabletTimeEl) {
			tabletTimeEl.textContent = `${hours}:${minutes}`;
		}
	}

	updateTime();
	setInterval(updateTime, 60000);

	const tabletApps = document.querySelectorAll('.tablet-app');
	tabletApps.forEach(function(app) {
		app.addEventListener('click', function() {
			const appName = this.getAttribute('data-app');
			const appView = document.getElementById('tablet-app-' + appName);
			if (appView) {
				appView.classList.add('active');
				document.getElementById('tablet-home-screen').style.display = 'none';
			}
		});
	});

	const backBtns = document.querySelectorAll('.tablet-back-btn');
	backBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			const appView = this.closest('.tablet-app-view');
			if (appView) {
				appView.classList.remove('active');
			}
			document.getElementById('tablet-home-screen').style.display = 'flex';
		});
	});

	const homeBtn = document.getElementById('tablet-home-btn');
	if (homeBtn) {
		homeBtn.addEventListener('click', function() {
			const activeViews = document.querySelectorAll('.tablet-app-view.active');
			activeViews.forEach(function(view) {
				view.classList.remove('active');
			});
			document.getElementById('tablet-home-screen').style.display = 'flex';
		});
	}

	setTimeout(function() {
		const themeBtn = document.getElementById('tablet-theme-btn');
		if (themeBtn) {
			const savedTheme = localStorage.getItem('tabletTheme') || 'light';
			if (savedTheme === 'dark') {
				document.body.classList.add('dark-theme');
				themeBtn.classList.add('dimmed');
			} else {
				themeBtn.classList.remove('dimmed');
			}

			themeBtn.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				document.body.classList.toggle('dark-theme');
				if (document.body.classList.contains('dark-theme')) {
					themeBtn.classList.add('dimmed');
					localStorage.setItem('tabletTheme', 'dark');
				} else {
					themeBtn.classList.remove('dimmed');
					localStorage.setItem('tabletTheme', 'light');
				}
			});
		}
	}, 100);
}

if (typeof window !== 'undefined') {
	window.initTabletOS = initTabletOS;
}
