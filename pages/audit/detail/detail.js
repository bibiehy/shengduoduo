import useRequest from '../../../utils/request';
import { fetchAuditDetail, fetchAuditFahuoren, fetchAuditDriver } from '../../../service/audit';
import { form, delay, createGuid, goBackAndRefresh } from '../../../utils/tools';

Page({
	data: {
		id: '', // 详细 id
        roleType: '', // 1 发货人， 3 干线司机
        status: null, // 0为待审核 1为已审核 2审核拒绝
		defaultValues: {}, // 查看时候使用
	},
	async onAgree() { // 同意
        const { id, roleType } = this.data;
		const child = roleType == 1 ? this.selectComponent('#templateFahuoren') : this.selectComponent('#templateDrivers');
		const formValues = child.getFormValues(); // 需要验证
		if(formValues) {
			const fetchRequest = roleType == 1 ? fetchAuditFahuoren : fetchAuditDriver;
			const result = await useRequest(() => fetchRequest({ ...formValues, id, status: 1 }));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				goBackAndRefresh('audit', result); // 返回父页面并调用父页面的 onRefresh 方法
			}
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
		// this.setData({ id: Number(options['id']), roleType: options['roleType'], status: options['status'] });

		const result = await useRequest(() => fetchAuditDetail({ id: options['id'] }));
		if(result) {
			// 待审核
			if(options['status'] == 0) {
				result['wages'] = null;
			}

			// 发货人
			result['address'] = result['address'] ? JSON.parse(result['address']) : [];
			result['addressStr'] = (result['address'].map((adItem) => adItem['label'])).join('、');

			// 已审核
			if(options['status'] == 1 || options['status'] == 2) {
				this.setData({ defaultValues: result, roleType: options['roleType'], status: options['status'] });
			}else{
				//
				this.setData({ id: Number(options['id']), roleType: options['roleType'], status: options['status'] });

				// 调用子组件方法
				const child = options['roleType'] == 1 ? this.selectComponent('#templateFahuoren') : this.selectComponent('#templateDrivers');
				child.getPageRequest(result);
			}			
		}
	}
})