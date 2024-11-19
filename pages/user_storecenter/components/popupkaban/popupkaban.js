// 对外绑定事件
// bind:callback 回调函数，参数为 {}

Component({
	properties: {
		title: { type: String, value: '' },
		visible: { type: Boolean, value: false }, // 显示/隐藏
		data: { type: Array, value: [] }, // { card_no, status: 1：空闲，2：有货  3；已调度 }
		type: { type: String, value: '' }, // type: 1 表示分拣和修改，2 表示把卡位号设置为待调度
	},
	observers: {
		data: function(list) { // 监听外部传递的值
			const { type } = this.data;
			const newList = [];

			if(type == 1) {
				list.forEach((item) => {
					const newItem = { id: item['card_no'], checked: item['status'] >= 2, disabled: false };
					newList.push(newItem);
				});
			}else{ // 2
				list.forEach((item) => {
					if(item['status'] >= 2) { // 排除空闲的
						const newItem = { id: item['card_no'], checked: item['status'] >= 3, disabled: item['status'] >= 3 };
						newList.push(newItem);
					}
				});
			}

			this.setData({ dataList: newList });
        }
    },
	data: {
        dataList: [], // { id: 1, checked: false, disabled: false }
        allChecked: false, // 全选
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
		onCardClick(e) {
			const { dataList } = this.data;
			const thisItem = e.currentTarget.dataset.item;
			const thisIndex = dataList.findIndex((item) => item['id'] == thisItem['id']);
			dataList[thisIndex]['checked'] = !thisItem['checked'];
			this.setData({ dataList });
        },
		onAllChecked(e) { // 全选
            const { checked } = e.detail;
            const { dataList } = this.data;
            dataList.forEach((item) => {
                if(!item['disabled']) {
                    item['checked'] = checked;
                }
            });

            this.setData({ allChecked: checked, dataList });
        },
		onSure() {
			const { dataList } = this.data;
			const numList = [];

			dataList.forEach((item) => {
				if(item['checked']) {
					numList.push(item['id']);
				}
			});

			if(numList.length <= 0) {
				wx.showToast({ title: '请选择卡位号', duration: 1500, icon: 'error' });
			}else{
				this.triggerEvent('callback', { numList });
			}            
        }
    }
})