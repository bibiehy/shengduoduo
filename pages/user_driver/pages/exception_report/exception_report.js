import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
import useRequest from '../../../../utils/request';
import { delay, createGuid, form } from '../../../../utils/tools';
import { fetchExceptionReport } from '../../../../service/user_driver';

let actionSheetHandler = '';

Page({
	data: {
		dataList: [],
	},
	// 添加要上报的提货点
	onShowTihuodian() {
		const { dataList } = this.data;
		actionSheetHandler = ActionSheet.show({
			theme: ActionSheetTheme.List,
			selector: '#exceptionActionSheet',
			context: this,
			description: '请选择要上报的提货点',
			items: dataList
		});
	},
	onCenterSelected(e) {
		const { selected } = e.detail;
		const { dataList } = this.data;
		const thisIndex = dataList.findIndex((item) => item['id'] == selected['id']);
		dataList[thisIndex]['disabled'] = true;
		dataList[thisIndex]['color'] = 'rgba(0, 0, 0, 0.45)';
		this.setData({ dataList });
		actionSheetHandler.close();
	},
	onDelete(e) {
		const thisItem = e.currentTarget.dataset.item;
		const { dataList } = this.data;
		const thisIndex = dataList.findIndex((item) => item['id'] == thisItem['id']);
		dataList[thisIndex]['disabled'] = false;
		dataList[thisIndex]['color'] = 'rgba(0, 0, 0, 0.85)';
		this.setData({ dataList });
	},
	// 点击卡板
	onCardClick(e) {
		const { dataList } = this.data;
		const thisId = e.currentTarget.dataset.id;
		const subItem = e.currentTarget.dataset.item;
		const thisIndex = dataList.findIndex((item) => item['id'] == thisId);
		const kabanList = dataList[thisIndex]['kabanList'];
		const kabanIndex = kabanList.findIndex((item) => item['number'] == subItem['number']);
		kabanList[kabanIndex]['checked'] = !subItem['checked'];
		this.setData({ dataList });
	},
	async onSubmit() {
        // const driverId = form.getFieldValue(this, 'diaoduDriver');
		// const result = await useRequest(() => fetchTaskReport(params));
        // if(result) {
        //     wx.showToast({ title: '上报成功', icon: 'success' });
        //     await delay(500);
        //     wx.navigateBack({ delta: 1 });
        // }
	},
	onLoad({ jsonStr }) {
		const dataList = JSON.parse(jsonStr);
		const newList = [];
		dataList.forEach((item, index) => {
			const kabanList = item['card_list'].map((cardNumber) => ({ checked: false, number: cardNumber }));
			const newItem = {
				id: item['id'],
				pointId: item['point_id'],
				kabanList,
				label: item['point_name'], // 用于添加提货点
				disabled: index == 0, // 用于添加提货点
				color: index == 0 ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.85)',
			};

			newList.push(newItem);
		});

		this.setData({ dataList: newList });
	}
})