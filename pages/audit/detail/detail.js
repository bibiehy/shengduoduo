import useRequest from '../../../utils/request';
import { fetchAuditDetail, fetchAuditFahuoren, fetchAuditDriver } from '../../../service/audit';
import { form, delay, createGuid, goBackAndRefresh } from '../../../utils/tools';

Page({
	data: {
		id: '',
        roleType: '', // 1 发货人， 3 干线司机
        status: 0, // 0为待审核 1为已审核 2审核拒绝
		defaultValues: {},
	},
	async onAgree() { // 同意
        const { id, roleType } = this.data;
		const child = roleType == 1 ? this.selectComponent('#templateFahuoren') : this.selectComponent('#templateDrivers');
		const formValues = child.getFormValues(); // 需要验证
		const fetchRequest = roleType == 1 ? fetchAuditFahuoren : fetchAuditDriver;
		const result = await useRequest(() => fetchRequest({ ...formValues, id, status: 1 }));
		if(result) {
			wx.showToast({ title: '操作成功', icon: 'success' });
			await delay(500);
			goBackAndRefresh('audit', result); // 返回父页面并调用父页面的 onRefresh 方法
		}
	},
	async onRefuse() { // 拒绝
		const { id, roleType } = this.data;
		const child = roleType == 1 ? this.selectComponent('#templateFahuoren') : this.selectComponent('#templateDrivers');
		const formValues = child.getFormValuesUnverified(); // 不需要验证
		const fetchRequest = roleType == 1 ? fetchAuditFahuoren : fetchAuditDriver;
		const result = await useRequest(() => fetchRequest({ ...formValues, id, status: 2 }));
		if(result) {
			wx.showToast({ title: '操作成功', icon: 'success' });
			await delay(500);
			goBackAndRefresh('audit', result); // 返回父页面并调用父页面的 onRefresh 方法
		}
	},
	async onLoad(options) {
		//
		this.setData({ id: Number(options['id']), roleType: options['roleType'], status: options['status'] });

		const result = await useRequest(() => fetchAuditDetail({ id: options['id'] }));
		if(result) {
			this.setData({ defaultValues: result });
		}
	}
})