import useRequest from '../../utils/request';
import { fetchGetUserInfo } from '../../service/index';

// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 底部 tabbar
		tabbarActive: 'home',
		tabbarList: [
			{ value: 'home', label: '主页', icon: 'home' },
			{ value: 'order', label: '订单管理', icon: 'assignment' },
			{ value: 'operation ', label: '运营概况', icon: 'chart-combo' },
			{ value: 'user', label: '我的', icon: 'user' },
		],
	},
	onPageJump(e) {
		const { name } = e.currentTarget.dataset;
		if(name == 'guige') { // 规格管理
			wx.navigateTo({ url: '/pages/guige/guige' });
		}else if(name == 'pickup_point') { // 提货点
			wx.navigateTo({ url: '/pages/pickuppoint/pickuppoint' });
		}else if(name == 'store_center') { // 集货中心
			wx.navigateTo({ url: '/pages/storecenter/storecenter' });
		}else if(name == 'global') { // 全局信息设置
			wx.navigateTo({ url: '/pages/globalinfo/globalinfo' });
		}else if(name == 'audit') { // 信息审核
			wx.navigateTo({ url: '/pages/audit/audit' });
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