// 显示弹窗
// 1.点击显示弹窗设置visible: true，确认回调时设置 visible: false
// 或者
// const childComponent = this.selectComponent('#updateKaban');
// childComponent.onShowPopup();

// 对外绑定事件
// bind:callback 回调函数，参数为 {}

Component({
	properties: {
		title: { type: String, value: '' },
		visible: { type: Boolean, value: false }, // 显示/隐藏
		surebtn: { type: Boolean, value: true }, // 显示/隐藏
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