// import useRequest from './utils/request';
// import { fetchGetUserInfo } from './service/global';

import { getUserAndGoRolePage } from './utils/tools';

App({
	// 小程序的启动参数 options = wx.getLaunchOptionsSync();
	// https://developers.weixin.qq.com/miniprogram/dev/api/base/app/life-cycle/wx.getLaunchOptionsSync.html
	uploadURL: 'https://sddwl.tonglujipei.com/api/common/upload',
	userInfo: {},
	async onLaunch(options) {
		const token = wx.getStorageSync('MINI_PROGRAM_TOKEN') || '';
		if(token) {
			getUserAndGoRolePage(this, 500); // 获取用户信息保存到全局且跳到角色对应的页面
		}else{
			wx.reLaunch({ url: '/pages/login/login' });
		}	
	}
});
