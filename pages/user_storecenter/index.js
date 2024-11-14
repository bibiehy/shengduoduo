
// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 底部 tabbar
		tabbarActive: 'main',
		tabbarList: [
			{ value: 'main', label: '主页', icon: 'home' },
			{ value: 'task', label: '任务管理', icon: 'tree-round-dot' },
			{ value: 'fenjianyuan', label: '分拣员', icon: { name: 'fenjianyuan', prefix: 'iconfont', size: '22px' } },
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
	onSearchBar() { // Main 子组件调用
		this.setData({ tabbarActive: 'task' });
	},
	onLoad(options) {
		// 分拣员隐藏分拣员Tab
		if(app['userInfo']['role_type'] == 7) {
			const { tabbarList } = this.data;
			tabbarList.splice(2, 1);
			this.setData({ tabbarList });
		}
	}
});