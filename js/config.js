const ChatConfig = {
	getApiUrl: function() {
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			return 'http://localhost:3000';
		}
		// 强制使用 HTTP（因为还没配置 HTTPS）
		return 'http://drlc5417.top';
	}
};

if (typeof window !== 'undefined') {
	window.ChatConfig = ChatConfig;
}
