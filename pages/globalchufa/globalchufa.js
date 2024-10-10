import useRequest from '../../utils/request';
import { fetchGetGlobalInfo, fetchSetGlobalChufa } from '../../service/global';
import { form, delay } from '../../utils/tools';

Page({
	data: {
		detail: {}
	},
	async onSave() {
		const formValues = form.validateFields(this, ['formInputRate', 'formTextareaDesc']);
		if(formValues) {			
			formValues['id'] = 1;
			const result = await useRequest(() => fetchSetGlobalChufa(formValues));
			if(result) {
				wx.showToast({ title: '保存成功', icon: 'success', duration: 2000 });
				await delay(2000);
				wx.navigateBack();
			}
		}
	},
	async onLoad(options) {
		const result = await useRequest(() => fetchGetGlobalInfo());
		if(result) {
			this.setData({ detail: { ...result } });
		}
	},
	onReady() {

	}
});