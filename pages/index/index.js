import useRequest from '../../utils/request';
import { fetchGetUserInfo } from '../../service/index';

// 获取 app 实例
const app = getApp();

Page({
	data: {

	},
	async onLoad() {
		// https://developers.weixin.qq.com/miniprogram/dev/api/base/app/life-cycle/wx.getLaunchOptionsSync.html
		// wx.getLaunchOptionsSync(); 订单信息页面处理 path 启动小程序的路径  query 启动小程序的参数
		// const token = wx.getStorageSync('MINI_PROGRAM_TOKEN') || '';
		// if(token) {
		// 	const result = await useRequest(fetchGetUserInfo); // 请求用户信息
		// 	app.userInfo = result; // 把用户信息保存到全局
		// 	const roleType = result['role_type']; // 获取角色类型
		// 	if(roleType == 1) {

		// 	}else if(roleType == 2) {

		// 	}else if(roleType == 12) { // 超级管理员
		// 		wx.reLaunch({ url: '/pages/administrator/administrator' });
		// 	}
		// }else{
		// 	wx.reLaunch({ url: '/pages/login/login' });
		// }		
	}
});