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
			{ value: 'order', label: '订单管理', icon: 'assignment' },
			{ value: 'operation', label: '运营概况', icon: 'chart-combo' },
			{ value: 'personal', label: '个人中心', icon: 'user' },
		],
	},
	onTabbar(e) {
		const { tabbarActive } = this.data;
		const { value } = e.detail;

		if(tabbarActive == value) {
			return false;
		}

		if(['order', 'operation'].includes(value)) {
			wx.showToast({ icon: 'warn', title: '暂未开放' })
		}else{
			this.setData({ tabbarActive: value });
		}
	},
	onLoad(options) {
		console.log('admin', app);
	},
	onReady() {

	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	},
});