// 对外绑定事件
// bind:callback 回调函数，参数为 {}

Component({
	properties: {
		title: { type: String, value: '' },
		visible: { type: Boolean, value: false } // 显示/隐藏
	},
	data: {
		
	},
	methods: {
		onShowPopup() {
            this.setData({ visible: true });
        },
        onHidePopup() {
            this.setData({ visible: false });
        },
        onVisibleChange(e) {
            this.setData({ visible: e.detail.visible });
		},
		onSure() {
            this.triggerEvent('callback', {});
        }
    }
})