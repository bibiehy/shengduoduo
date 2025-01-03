Page({
	data: {
		// 底部 tabbar
		tabbarActive: 'main',
		tabbarList: [
			{ value: 'main', label: '主页', icon: 'home' },
			{ value: 'task', label: '任务管理', icon: 'tree-round-dot' },
			{ value: 'shouhuoren', label: '收货人', icon: { name: 'shouhuoren', prefix: 'iconfont', size: '22px' } },
			{ value: 'personal', label: '个人中心', icon: 'user' },
		],
	},
	onTabbar(e) {
		const { tabbarActive } = this.data;
		const { value } = e.detail;

		if(tabbarActive == value) {
			return false;
		}

		this.setData({ tabbarActive: value });
	},
	onLoad(options) {
		
	}
});