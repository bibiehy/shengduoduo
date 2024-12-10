// pages/user_storecenter/components/print/print.js
Component({
	properties: {
		title: { type: String, value: '请选择要打印的规格' },
		taskId: { type: Number, value: '' },
		display: { type: String, value: 'inline-block' },
	},
	data: {
		visible: false,
		options: [{ spec: 10, spec_name: '1-10斤', card_no: ['1/50', '2/50', '3/50'] }, { spec: 11, spec_name: '11-20斤', card_no: ['1/50', '2/50', '3/50'] }],
		searchOptions: [{ spec: 10, spec_name: '1-10斤', card_no: ['1/50', '2/50', '3/50'] }, { spec: 11, spec_name: '11-20斤', card_no: ['1/50', '2/50', '3/50'] }],
		showSpecId: '', // 展开的规格ID
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
		onSearch(e) {
            const { options } = this.data;
            const thisValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            if(thisValue) {
                const newOptions = options.filter((item) => item['spec_name'].includes(thisValue));
                this.setData({ searchOptions: newOptions });
            }else{
                this.setData({ searchOptions: options });
            }
		},
		onArrow(e) {
			const { id } = e.currentTarget.dataset;
			this.setData({ showSpecId: id });
		},
		onAllChecked() { // 全选

		},
        onSure() {
            const { showSpecId, options } = this.data;

            if(!showSpecId) {
                wx.showToast({ icon: 'error', title: '请选择规格' });
                return false;
            }

            const thisOption = options.find((item) => item['spec'] == showSpecId);
            this.setData({ visible: false });
            this.triggerEvent('callback', { label: thisOption['label'], value: thisOption['value'] });
        }
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})