/*
*   只用于个人中心，基本信息和退出登录，以及编辑基本信息
*   1、defaultValues 是外面传进来的，只用于编辑保存后更新基本信息，以及更新全局用户信息
*   2、callback 回调用于编辑信息按钮点击事件
*/

import { delay, getRoleInfo } from '../../utils/tools';

const app = getApp(); // 获取 app 实例

Component({
	properties: {
		defaultValues: { type: Object, value: {} }
	},
	data: {
		userInfo: {},
		roleAllObject: {}, // 角色类型
        opacity: 0,
        // 退出登录
        showConfirm: false,
        confirmBtn: { content: '确定', variant: 'base' },
    },
    // 监听 properties 值变化
    observers: {
        defaultValues: function(newValues) { // 监听外部传递的 value
            if(Object.keys(newValues).length > 0) {
                // 手机号中间4位改为 *
                if(newValues['phone'] && !/\*/.test(newValues['phone'])) {
                    newValues['phone'] = String(newValues['phone']).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                }

                // 赋值
                app['userInfo'] = { ...app['userInfo'], ...newValues };
                this.setData({ userInfo: newValues });
            }			
        }
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
			const { roleAllObject } = getRoleInfo(); // 角色类型

			if(app['userInfo']['role_type'] == 5) { // 集货中心负责人
				app['userInfo']['nickname'] = app['userInfo']['center_name'];
			}

			this.setData({ userInfo: app['userInfo'], roleAllObject });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})