import { delay, getRoleInfo } from '../../utils/tools';

Component({
	properties: {
		
	},
	data: {
		userInfo: {},
		roleAllObject: {}
	},
	methods: {
		onEditUser() {
			this.triggerEvent('callback', {}, {});
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