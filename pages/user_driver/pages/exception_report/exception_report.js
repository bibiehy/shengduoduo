import useRequest from '../../../../utils/request';
import { delay, createGuid, form } from '../../../../utils/tools';
import { fetchExceptionReport } from '../../../../service/user_driver';

Page({
	data: {
        kabanList: [{ checked: false, number: 1 }, { checked: false, number: 2 }, { checked: false, number: 3 }]
    },
	onCardClick(e) { // 点击卡板
		const { kabanList } = this.data;
		const thisItem = e.currentTarget.dataset.item;
		const thisIndex = kabanList.findIndex((item) => item['number'] == thisItem['number']);
		kabanList[thisIndex]['checked'] = !thisItem['checked'];
		this.setData({ kabanList });
	},
	async onSubmit() {
        const driverId = form.getFieldValue(this, 'diaoduDriver');
		const result = await useRequest(() => fetchTaskReport(params));
        if(result) {
            wx.showToast({ title: '上报成功', icon: 'success' });
            await delay(500);
            wx.navigateBack({ delta: 1 });
        }
	},
	onLoad(options) {
		
	}
})