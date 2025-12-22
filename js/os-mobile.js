function initMobileOS() {
	if (window.mobileOSInitialized) return;
	window.mobileOSInitialized = true;

	function updateTime() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const mobileTimeEl = document.getElementById('mobile-time');
		if (mobileTimeEl) {
			mobileTimeEl.textContent = `${hours}:${minutes}`;
		}
	}

	updateTime();
	setInterval(updateTime, 60000);

	const mobileApps = document.querySelectorAll('.mobile-app');
	mobileApps.forEach(function(app) {
		app.addEventListener('click', function() {
			const appName = this.getAttribute('data-app');
			const appView = document.getElementById('mobile-app-' + appName);
			if (appView) {
				appView.classList.add('active');
				document.getElementById('mobile-home-screen').style.display = 'none';
			}
		});
	});

	const backBtns = document.querySelectorAll('.back-btn');
	backBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			const appView = this.closest('.mobile-app-view');
			if (appView) {
				appView.classList.remove('active');
			}
			document.getElementById('mobile-home-screen').style.display = 'flex';
		});
	});

	const mobilePdfBack = document.getElementById('mobile-pdf-back');
	if (mobilePdfBack) {
		mobilePdfBack.addEventListener('click', function(e) {
			e.stopPropagation();
			const pdfView = document.getElementById('mobile-app-pdf');
			const publicationsView = document.getElementById('mobile-app-publications');
			
			if (pdfView) {
				pdfView.classList.remove('active');
			}
			if (publicationsView) {
				publicationsView.classList.add('active');
			}
		});
	}

	const homeBtn = document.getElementById('home-btn');
	if (homeBtn) {
		homeBtn.addEventListener('click', function() {
			const activeViews = document.querySelectorAll('.mobile-app-view.active');
			activeViews.forEach(function(view) {
				view.classList.remove('active');
			});
			document.getElementById('mobile-home-screen').style.display = 'flex';
		});
	}

	setTimeout(function() {
		const themeBtn = document.getElementById('theme-btn-mobile');
		if (themeBtn) {
			const savedTheme = localStorage.getItem('mobileTheme') || 'light';
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
					localStorage.setItem('mobileTheme', 'dark');
				} else {
					themeBtn.classList.remove('dimmed');
					localStorage.setItem('mobileTheme', 'light');
				}
			});
		}
	}, 100);
}

if (typeof window !== 'undefined') {
	window.initMobileOS = initMobileOS;
}
