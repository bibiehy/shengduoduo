import useRequest from '../../../utils/request';
import { fetchAllPickupPoint, fetchAllGuige } from '../../../service/global';
import { fetchStoreCenterCreate, fetchStoreCenterEdit } from '../../../service/storecenter';
import { form, delay, createGuid, goBackAndRefresh } from '../../../utils/tools';

Page({
	data: { // 以下所有格式化数据都同接口返回 keyName 保持一直
		type: '', // create/edit
		defaultValues: {}, // 赋值，除主管信息和提货点信息		
		// 所有提货点、所有规格
		allPickupList: [], // 添加过的需禁用 { label: '高州新城', value: 1, disabled: false }
		allGuigeList: [], // 格式化成跟接口 key 一样 { spec: 1, spec_name: "食品粮油", freight_rate: '运费比例' } spec -> 规格id
		// 主管信息
		zhuguanList: [], // { id: '', director: '', director_phone: '' }
		// 提货点信息
		visible: false, // 是否显示弹窗
		radioOptions: [{ label: '否', value: 0 }, { label: '是', value: 1 }],
		tihuodianList: [],
		actionItem: {}, // 添加/编辑/删除操作的项
		// 确认删除提货点弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base' },
	},
	// 获取所有提货点和规格
	async onAllList(type, jsonItem) {
		wx.showLoading();
		const resultPickup = await useRequest(() => fetchAllPickupPoint());
		const resultGuige = await useRequest(() => fetchAllGuige());
		wx.hideLoading();

		const pickupList = resultPickup || [];
		const guigeList = resultGuige || [];
		const pickupIds = type == 'edit' ? jsonItem['pickup_points'].map((item) => item['point_id']) : [];
		const newPickupList = [];
		const newGuigeList = [];

		pickupList.forEach((item) => { // { label: '', value: '', disabled: false }
			newPickupList.push({ label: item['name'], value: item['id'], disabled: pickupIds.includes(item['id']) });
		});

		guigeList.forEach((item) => { // { spec: 1, spec_name: "食品粮油", freight_rate: '运费比例' }
			newGuigeList.push({ spec: item['id'], spec_name: item['name'], freight_rate: '' });
		});
		
		console.log(resultPickup);
		console.log(resultGuige);
		console.log(newPickupList);
		console.log(newGuigeList);

		this.setData({ allPickupList: newPickupList, allGuigeList: newGuigeList });
	},
	// 主管事件
	onAddZhuguan() {
		const { zhuguanList } = this.data;
		const id = createGuid(6);
		zhuguanList.push({ id, director: '', director_phone: '' });
		this.setData({ zhuguanList });
	},
	onDeleteZhuguan(e) {
		const { zhuguanList } = this.data;
		const { id } = e.currentTarget.dataset;
		const thisIndex = zhuguanList.findIndex((item) => item['id'] == id);
		zhuguanList.splice(thisIndex, 1);
		this.setData({ zhuguanList });
	},
	// 所属提货点事件
	onAddTihuodian() {
		const { allGuigeList } = this.data;
		const newActionItem = { spec_freight: allGuigeList };
		this.setData({ visible: true, actionItem: newActionItem });
	},
	onEditTihuodian(e) {
		const { item } = e.currentTarget.dataset;
		this.setData({ visible: true, actionItem: item });
	},
	onPopupSure() { // 添加/编辑提货点弹窗确认动作
		const { allPickupList, allGuigeList, tihuodianList, actionItem } = this.data;
		const formInputIds = ['formInputTihuodian', 'formInputReachTime', 'formInputClosed', 'formInputCardNum', 'formInputCancelRate', 'formInputLastTime'];
		actionItem['spec_freight'].forEach((item, index) => formInputIds.push(`formInputGuige__${index + 1}`));

		const formValues = form.validateFields(this, formInputIds);

		// 添加提货点名称
		const pickupItem = allPickupList.find((item) => item['value'] == formValues['point_id']);
		formValues['point_name'] = pickupItem['label'];

		// 格式化
		const newFormValues = { spec_freight: [] };
		Object.keys(formValues).forEach((keyName) => {
			if(keyName.includes('__')) { // 规格类别运费数据
				const thisArray = keyName.split('__');
				newFormValues['spec_freight'].push({ spec: thisArray[1], spec_name: thisArray[2], freight_rate: formValues[keyName] });
			}else{
				newFormValues[keyName] = formValues[keyName];
			}
		});

		console.log('newFormValues', newFormValues);
		if(actionItem['id']) { // 编辑
			const thisIndex = tihuodianList.findIndex((item) => item['id'] == actionItem['id']);
			tihuodianList.splice(thisIndex, 1, { ...newFormValues, id: actionItem['id'] });
		}else{
			tihuodianList.push({ ...newFormValues, id: createGuid(6) });
		}
		
		this.setData({ tihuodianList, visible: false });
	},
	onDeleteTihuodian(e) { // 显示二次确认删除弹窗
		const { item } = e.currentTarget.dataset;
		this.setData({ showConfirm: true, actionItem: item });
	},
	async onDeleteSure() { // 二次确认删除确定
		const { tihuodianList, allPickupList, actionItem } = this.data;
		const index01 = tihuodianList.findIndex((item) => item['point_id'] == actionItem['point_id']);
		const index02 = allPickupList.findIndex((item) => item['value'] == actionItem['point_id']);
		const newPickupItem = { ...allPickupList[index02], disabled: false };
		tihuodianList.splice(index01, 1);
		allPickupList.splice(index02, 1, newPickupItem);

		this.setData({ tihuodianList, allPickupList, showConfirm: false, actionItem: {} });
	},
	onCancelDialog() { // 二次确认取消
		this.setData({ showConfirm: false });
	},	
	async onSave() { // 保存
		const { defaultValues } = this.data;
		const formValues = form.validateFields(this);
		if(formValues) {
			const { type } = this.data;
			if(type === 'edit') {
				formValues['id'] = defaultValues['id'];
			}

			formValues['head_pic'] = formValues['head_pic'][0]['url'];
			formValues['payment_code'] = formValues['payment_code'][0]['url'];
			formValues['address'] = JSON.stringify(formValues['address']);

			const result = type == 'edit' ? (await useRequest(() => fetchStoreCenterEdit(formValues))) : (await useRequest(() => fetchStoreCenterCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				goBackAndRefresh(type, result['data']); // 返回父页面并调用父页面的 onRefresh 方法，当 type=edit 时才使用 result['data']
			}
		}
	},
	onLoad({ type, strItem }) {
		// type: create/edit
		const jsonItem = JSON.parse(strItem || "{}");

		// 图像为数组
		if(type == 'edit') {
			jsonItem['head_pic'] = [{ url: jsonItem['head_pic'] }];
			jsonItem['payment_code'] = [{ url: jsonItem['payment_code'] }];
		}

		// 主管列表需要添加 id，提货点使用 point_id
		const zhuguanList = type == 'edit' ? jsonItem['director_list'].map((item) => ({ id: createGuid(6), ...item })) : [{ id: createGuid(6), director: '', director_phone: '' }];
		const tihuodianList = type == 'edit' ? jsonItem['pickup_points'].map((item) => ({ id: createGuid(6), ...item })) : [];
		this.setData({ type, defaultValues: jsonItem, zhuguanList, tihuodianList });

		// 获取所有提货点和规格
		this.onAllList(type, jsonItem);
	}
})