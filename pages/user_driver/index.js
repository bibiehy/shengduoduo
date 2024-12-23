
// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 底部 tabbar
		tabbarActive: 'main',
		tabbarList: [
			{ value: 'main', label: '主页', icon: 'home' },
			{ value: 'profit', label: '我的收益', icon: 'wealth' },
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