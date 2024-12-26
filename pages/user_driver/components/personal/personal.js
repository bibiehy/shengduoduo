
Component({
	properties: {

	},
	data: {
        defaultValues: {}, // 编辑后的信息，用于改变基本信息
	},
	methods: {
        onEditUser() {
            // https://developers.weixin.qq.com/community/develop/article/doc/00048430f146e080cb2e9548456013
            wx.navigateTo({ 
                url: `/pages/user_driver/pages/personal_edit/personal_edit`,
                events: { // 注册事件监听器
                    acceptOpenedData: (data) => { // 监听由子页面触发的同名事件
                        this.setData({ defaultValues: data });
                    }
                }
            });
        },
        onPageView(e) {
            const { type } = e.currentTarget.dataset;
            if(type == 'profit') {
                wx.navigateTo({ url: `/pages/user_driver/pages/profit/profit` });
            }else if(type == 'report') {
                wx.navigateTo({ url: `/pages/user_driver/pages/profit/profit` });
            }
        }
    },
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})