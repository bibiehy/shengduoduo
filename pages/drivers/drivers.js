import useRequest from '../../utils/request';
import { fetchGetUserInfo } from '../../service/index';

// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 传到 main 组件
		isShowBack: false,
		// 底部 tabbar
		tabbarActive: 'main',
		tabbarList: [
			{ value: 'main', label: '主页', icon: 'home' },
			{ value: 'task', label: '任务管理', icon: 'tree-round-dot' },
			{ value: 'driver', label: '司机管理', icon: { name: 'truck', prefix: 'iconfont' } },
			{ value: 'personal', label: '个人中心', icon: 'user' },
		],
	},
	onTabbar(e) {
		const { tabbarActive } = this.data;
		const { value } = e.detail;

		if(tabbarActive == value) {
			return false;
		}

		if(['task'].includes(value)) {
			wx.showToast({ icon: 'warn', title: '暂未开放' })
		}else{
			this.setData({ tabbarActive: value });
		}
	},
	onLoad(options) {
		// 从超管页面调过来，需显示回退图标
		const { from } = options;
		if(from && from == 'admin') {
			this.setData({ isShowBack: true });
		}
	}
});