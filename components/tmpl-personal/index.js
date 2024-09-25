import { delay, getRoleInfo, getScrollColor } from '../../utils/tools';

Component({
	properties: {
		
	},
	data: {
		userInfo: {},
		roleAllObject: {}, // 角色类型
        opacity: 0,
        // 退出登录
        showConfirm: false,
	},
	methods: {
        // 编辑个人信息
		onEditUser() {
			this.triggerEvent('callback', {}, {});
        },
        // 控制透明度 navigation-bar
		onScrollView(e) {
			const { scrollTop } = e.detail;
			const thisOpacity = scrollTop / 120;
			const newOpacity = thisOpacity >= 1 ? 1 : thisOpacity;
			this.setData({ opacity: newOpacity });
        },
        // 退出登录
        onVisibleDialog() { // 显示和关闭确认退出弹框
            const { showConfirm } = this.data;
            this.setData({ showConfirm: !showConfirm });
        },
        async onSureLogout() {
            this.setData({ showConfirm: false });
            wx.showToast({ title: '退出成功', icon: 'success' });
            wx.clearStorageSync();
            await delay(1500);
            wx.reLaunch({ url: '/pages/login/login' });
        }
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			const app = getApp(); // 获取 app 实例
			const { roleAllObject } = getRoleInfo(); // 角色类型
			
			this.setData({ userInfo: app['userInfo'], roleAllObject });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})