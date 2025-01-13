import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
import useRequest from '../../../../utils/request';
import { delay, createGuid, form } from '../../../../utils/tools';
import { fetchExceptionReport } from '../../../../service/user_driver';

let actionSheetHandler = '';

Page({
	data: {
        dataList: [], // true 表示已添加要上报的提货点
        tabValue: 1, // 1: 继续配置; 2: 终止配送;
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
    // Tabs
    onTabsClick(e) {
        const tabValue = e.currentTarget.dataset.value;
        this.setData({ tabValue });
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
    // 提交
    getParams_1() { // 继续配送
        const formValues = form.validateFields(this);
        if(formValues) {
            const { dataList } = this.data;
            const paramList = [];
            dataList.forEach((item) => {
                if(item['disabled']) {
                    const cardList = item['kabanList'].filter((kabanItem) => kabanItem['checked']);
                    const cardNumber = cardList.map((cardItem) => cardItem['number']);
                    paramList.push({ id: item['id'], point_id: item['pointId'], card_list: cardNumber, img: formValues[`img__${item['id']}`], remark: formValues[`remark__${item['id']}`] });
                }
			});

            return paramList;
        } 
        
        return false;
	},
	getParams_2() { // 终止配送
		const formValues = form.validateFields(this);
        if(formValues) {
            const { dataList } = this.data;
            const paramList = [];
            dataList.forEach((item) => {
				const cardNumber = item['kabanList'].map((kabanItem) => kabanItem['number']);
				paramList.push({ id: item['id'], point_id: item['pointId'], card_list: cardNumber, img: formValues['img'], remark: formValues['remark'] });
			});

            return paramList;
        } 
        
        return false;
	},
	async onSubmit() {
		const { tabValue } = this.data;
		const paramList = tabValue == 1 ? this.getParams_1() : this.getParams_2();
		if(paramList) {
			const params = { type: tabValue, report_info: paramList };
			const result = await useRequest(() => fetchExceptionReport(params));
			if(result) {
				wx.showToast({ title: '上报成功', icon: 'success' });
				await delay(500);
				wx.navigateBack({ delta: 1 });
			}
		}        
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
				disabled: index == 0, // 用于添加提货点，true 表示已添加要上报的提货点
				color: index == 0 ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.85)',
			};

			newList.push(newItem);
		});

		this.setData({ dataList: newList });
	}
})