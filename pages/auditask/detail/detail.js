import useRequest from '../../../utils/request';
import { fetchAuditDetail, fetchAuditResult } from '../../../service/auditask';
import { form, delay, createGuid } from '../../../utils/tools';

Page({
	data: {
		title: '',
		defaultValues: {}, // 查看时候使用
	},
	async onAgreeRefuse(e) { // 同意/拒绝
		const { status } = e.currentTarget.dataset;
        const { defaultValues } = this.data;
		const result = await useRequest(() => fetchAuditResult({ id: defaultValues['id'], status, remark: '' }));
		if(result) {
			wx.showToast({ title: '操作成功', icon: 'success' });
			await delay(500);
			wx.navigateBack({ delta: 1, success: () => {
				const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
				eventChannel.emit('acceptOpenedData', result);
			}});
		}
	},
	async onLoad(options) {
		const result = await useRequest(() => fetchAuditDetail({ id: options['id'] }));
		if(result) {
			const title = result['type'] == 1 ? '取消任务' : (result['type'] == 2 ? '数量异常上报' : '规格异常上报');
			this.setData({ title, defaultValues: result });
		}
	}
})