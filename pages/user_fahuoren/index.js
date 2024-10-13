import useRequest from '../../utils/request';
import { fetchGetUserInfo } from '../../service/index';

// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 底部 tabbar
		tabbarActive: 'main',
		tabbarList: [
			{ value: 'main', label: '主页', icon: 'home' },
			{ value: 'order', label: '任务管理', icon: 'tree-round-dot' },
			{ value: 'operation', label: '收货人', icon: { name: 'shouhuoren', prefix: 'iconfont', size: '24px' } },
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
		console.log('admin', app);
	},
	// onPageScroll(e) { 
	// 	console.log(111, e);
	// 	// const navigationBackgroundColor = getScrollColor(e.scrollTop, '#1677ff');
    //     // if(navigationBackgroundColor) {
    //     //     this.setData({ navigationBackgroundColor });
    //     // }
    // }
});