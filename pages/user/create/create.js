import useRequest from '../../../utils/request';
import { fetchUserDetail, fetchAddFahuoren, fetchAddDriver, fetchAddYewufzren, fetchEditFahuoren, fetchEditDriver, fetchEditYewufzren } from '../../../service/user';
import { form, delay, createGuid, goBackAndRefresh, getRoleInfo } from '../../../utils/tools';

// 角色类型
const { roleAllObject } = getRoleInfo();

Page({
	data: {
		roleAllObject: roleAllObject,
		actionType: '', // create 添加; edit 编辑
		roleType: '', // 角色类型
		defaultValues: {}, // edit 时为详细信息	
	},
	async onSubmit() { // 确认提交
		const { actionType, roleType, defaultValues } = this.data;

		let childComponent = '', fetchRequest = '';
		if(roleType == 1) { // 发货人
			childComponent = this.selectComponent('#templateFahuoren');
			fetchRequest = actionType == 'create' ? fetchAddFahuoren : fetchEditFahuoren;
		}else if(roleType == 3) { // 干线司机
			childComponent = this.selectComponent('#templateDrivers');
			fetchRequest = actionType == 'create' ? fetchAddDriver : fetchEditDriver;
		}

		const formValues = childComponent.getFormValues(); // 需要验证
		if(formValues) {
			if(actionType == 'edit') {
				formValues['id'] = defaultValues['id'];
			}
	
			const result = await useRequest(() => fetchRequest({ ...formValues }));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				goBackAndRefresh(actionType, result); // 返回父页面并调用父页面的 onRefresh 方法
			}
		}
	},
	async onLoad(options) {
		const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
		this.setData({ actionType: type, roleType: jsonItem['role_type'] });

		if(type == 'create') { // 调用子组件方法
			if(jsonItem['role_type'] == 1) {
				this.selectComponent('#templateFahuoren').getPageRequest({});
			}else if(jsonItem['role_type'] == 3) {
				this.selectComponent('#templateDrivers').getPageRequest({});
			}
		}else{ // 编辑
			const result = await useRequest(() => fetchUserDetail({ id: jsonItem['id'] }));
			if(result) {
				// 设置详情信息
				this.setData({ defaultValues: result });
	
				// 调用子组件方法
				if(jsonItem['role_type'] == 1) {
					this.selectComponent('#templateFahuoren').getPageRequest(result);
				}else if(jsonItem['role_type'] == 3) {
					this.selectComponent('#templateDrivers').getPageRequest(result);
				}			
			}
		}
	}
})