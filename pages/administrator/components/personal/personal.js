
Component({
	properties: {

	},
	data: {

	},
	methods: {
        onEditUser() {
            // https://developers.weixin.qq.com/community/develop/article/doc/00048430f146e080cb2e9548456013
            wx.navigateTo({ 
                url: `/pages/administrator/pages/edit/edit`,
                events: { // 注册事件监听器
                    acceptOpenedData: (data) => { // 监听由子页面触发的同名事件
                        console.log(111, data);
                        this.setData({ ...data });
                    }
                }
            });
        }
    },
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})