const ChatConfig = {
	getApiUrl: function() {
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			return 'http://localhost:3000';
		}
		return '';
	}
};

if (typeof window !== 'undefined') {
	window.ChatConfig = ChatConfig;
}
