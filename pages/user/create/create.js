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
		}else if([8, 9, 10, 11].includes(roleType)) { // 干线调度/业务负责人/财务管理/差异审核员
			childComponent = this.selectComponent('#templateYewufzren');
			fetchRequest = actionType == 'create' ? fetchAddYewufzren : fetchEditYewufzren;
		}

		const formValues = childComponent.getFormValues(); // 需要验证
		if(formValues) {
			formValues['role_type'] = roleType;

			if(actionType == 'edit') {
				formValues['id'] = defaultValues['id'];
			}
	
			const result = await useRequest(() => fetchRequest({ ...formValues }));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(1000);
				goBackAndRefresh(actionType, result); // 返回父页面并调用父页面的 onRefresh 方法
			}
		}
	},
	async onLoad(options) {
		//
		const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
		this.setData({ actionType: type, roleType: jsonItem['role_type'] });

		if(type == 'create') { // 只可能是这几个角色，8干线调度/9业务负责人/10财务管理/11差异审核员
			this.selectComponent('#templateYewufzren').getPageRequest({}); // 调用子组件方法

			// if(jsonItem['role_type'] == 1) { // 发货人
			// 	this.selectComponent('#templateFahuoren').getPageRequest({});
			// }else if(jsonItem['role_type'] == 3) { // 干线司机
			// 	this.selectComponent('#templateDrivers').getPageRequest({});
			// }else if([8, 9, 10, 11].includes(jsonItem['role_type'])) { // 干线调度/业务负责人/财务管理/差异审核员
			// 	this.selectComponent('#templateYewufzren').getPageRequest({});
			// }
		}else if(type == 'edit') { // 只可能是这几个角色，8干线调度/9业务负责人/10财务管理/11差异审核员
			const result = await useRequest(() => fetchUserDetail({ id: jsonItem['id'] }));
			if(result) {
				this.setData({ defaultValues: result }); // 设置详情信息
				this.selectComponent('#templateYewufzren').getPageRequest(result); // 调用子组件方法

				// if(jsonItem['role_type'] == 1) { // 发货人
				// 	this.selectComponent('#templateFahuoren').getPageRequest(result);
				// }else if(jsonItem['role_type'] == 3) { // 干线司机
				// 	this.selectComponent('#templateDrivers').getPageRequest(result);
				// }else if([8, 9, 10, 11].includes(jsonItem['role_type'])) { // 干线调度/业务负责人/财务管理/差异审核员
				// 	this.selectComponent('#templateYewufzren').getPageRequest(result);
				// }		
			}
		}else if(type == 'view') { // 查看，1发货人/2收货人/3干线司机/4提货点负责人/5集货中心负责人/6集货中心主管/7分拣员
			let result = await useRequest(() => fetchUserDetail({ id: jsonItem['id'] }));
			if(result) {
				// 
				if([4, 5].includes(result['role_type'])) {
					result = result['extra'];
				}else if(result['role_type'] == 6) {
					result['address'] = result['extra']['address'];
					result['region'] = result['extra']['region'];
					result['center_name'] = result['extra']['name'];
				}
				
				if(result['address']) {
					result['address'] = result['address'] ? JSON.parse(result['address']) : [];
					result['addressStr'] = (result['address'].map((adItem) => adItem['label'])).join('、');
				}

				this.setData({ defaultValues: result });
			}
		}
	}
})