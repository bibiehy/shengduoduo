// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
		roleType: '', // 角色类型，5 集货中心负责人；6 集货中心主管；7 分拣员
        defaultValues: {}, // 编辑后的信息，用于改变基本信息
	},
	methods: {
        onEditUser() {
			const userInfo = app.userInfo;
			if(userInfo['role_type'] == 5) { // 集货中心负责人
				const strItem = JSON.stringify({ id: userInfo['center_id'] });
				wx.navigateTo({ 
					url: `/pages/storecenter/create/create?type=edit&strItem=${strItem}&fromto=personal`,
					events: { // 注册事件监听器
						acceptOpenedData: (data) => { // 监听由子页面触发的同名事件
							const defaultValues = { avator: data['head_pic'], nickname: data['name'], username: data['head_user'], phone: data['head_phone'], role_type: 5 };
							this.setData({ defaultValues });
						}
					}
				});
			}else if(userInfo['role_type'] == 6) { // 集货中心主管
				wx.navigateTo({ 
					url: `/pages/user_storecenter/pages/personal_edit/personal_edit`,
					events: { // 注册事件监听器
						acceptOpenedData: (data) => { // 监听由子页面触发的同名事件
							this.setData({ defaultValues: data });
						}
					}
				});
			}else if(userInfo['role_type'] == 7) { // 分拣员
				const strItem = JSON.stringify({ id: userInfo['id'] });
				wx.navigateTo({
					url: `/pages/user_storecenter/pages/fenjianyuan_create/fenjianyuan_create?type=edit&strItem=${strItem}`,
					events: { // 注册事件监听器
						acceptOpenedData: (data) => { // 监听由子页面触发的同名事件
							this.setData({ defaultValues: data });
						}
					}
				});
			}
		},
		onViewProfit() { // 查看收益
			wx.navigateTo({ url: '/pages/user_storecenter/pages/profit/profit' });			
		}
    },
    lifetimes: {
		attached() { // 组件完全初始化完毕
			const userInfo = app.userInfo;
			this.setData({ roleType: userInfo['role_type'] });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})