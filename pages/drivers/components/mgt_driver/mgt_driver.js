Component({
	properties: {

	},
	data: {
        tabActive: 'list', // Tabs 切换：list 司机列表，status 配送概况
	},
	methods: {
        onTabs(e) { // Tabs 切换
            const { value } = e.currentTarget.dataset;
            this.setData({ tabActive: value });
        }
    },
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})