import useRequest from '../../../../utils/request';
import { fetchDiaoduCreate, fetchDiaoduEdit, fetchCenterDrivers, fetchDiaoduKaban } from '../../../../service/drivers';
import { form, delay } from '../../../../utils/tools';

Page({
	data: {
		defaultItem: {},
		driverList: [],
		kabanList: []
	},
	async getDrivers() { // 要调度的司机
		const { defaultItem } = this.data;
		const result = await useRequest(() => fetchCenterDrivers({ centerId: defaultItem['value'], pointId: defaultItem['point_id'] }));
		if(result) {
			const newList = [];
			result.forEach((item) => {
				const label = `${item['driver_name']}(${item['phone']})`;
				const value = item['driver_id'];
				const disabled = [2, 3, 4, 88].includes(item['status']); // 0：空闲，1：待通知，2：已通知，3：已收到，88：已拒绝，4：配送中，5：已送达
				const isOftenUsed = item['use_time'] == 1; // 0：不经常使用; 1：经常使用
				const usedNum = item['card_info'] ? item['card_info']['use_num'] : 0;
				const totalNum = item['card_info'] ? item['card_info']['total_num'] : 0;
				const newItem = { label, value, disabled, status: item['status'], isOftenUsed, usedNum, totalNum };
				newList.push(newItem);
			});

			this.setData({ driverList: newList });
		}
	},
	async getKaban() { // 获取可调度的卡板
		const { defaultItem } = this.data;
		const result = await useRequest(() => fetchDiaoduKaban({ centerId: defaultItem['value'], pointId: defaultItem['point_id'] }));
		if(result) {
			const kabanList = [];
			result.forEach((item) => {
				if(defaultItem['id']) { // 编辑
					const isExsit = defaultItem['card_list'].includes(item['card_no']);
					kabanList.push({ number: item['card_no'], checked: isExsit });
				}else{
					kabanList.push({ number: item['card_no'], checked: false });
				}				
			});

			this.setData({ kabanList });
		}
	},
	onCardClick(e) { // 点击卡板
		const { kabanList } = this.data;
		const thisItem = e.currentTarget.dataset.item;
		const thisIndex = kabanList.findIndex((item) => item['number'] == thisItem['number']);
		kabanList[thisIndex]['checked'] = !thisItem['checked'];
		this.setData({ kabanList });
	},
	async onSubmit() {
		const { defaultItem, kabanList } = this.data;
		const centerId = defaultItem['value'];
		const pointId = defaultItem['point_id'];
		const driverId = form.getFieldValue(this, 'diaoduDriver');
		const kabanChecked = [];
		kabanList.forEach((item) => {
			if(item['checked']) {
				kabanChecked.push(item['number']);
			}
		});

		if(!driverId) {
			wx.showToast({ title: '请选择调度司机', duration: 2500, icon: 'error' });
			return false;
		}

		if(kabanChecked.length <= 0) {
			wx.showToast({ title: '请设置卡板号', duration: 2500, icon: 'error' });
			return false;
		}

		const params = { center_id: centerId, point_id: pointId, driver_id: driverId, card_list: kabanChecked };

		if(defaultItem['id']) { // 编辑
			params['id'] = defaultItem['id'];
		}

		const result = defaultItem['id'] ? (await useRequest(() => fetchDiaoduEdit(params))) : (await useRequest(() => fetchDiaoduCreate(params)));
		if(result) {
			wx.showToast({ title: '操作成功', icon: 'success' });
			await delay(500);
			if(defaultItem['id']) { // 编辑
				wx.navigateBack({ delta: 1, success: () => {
					const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
					eventChannel.emit('acceptOpenedData', params);
				}});
			}else{
				wx.navigateBack({ delta: 1 });
			}			
		}
	},
	onLoad({ strItem }) {
		const jsonItem = JSON.parse(strItem);
		this.setData({ defaultItem: jsonItem });

		// 接口调用
		this.getDrivers();
		this.getKaban();
	}
})