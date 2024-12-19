import useRequest from '../../../utils/request';
import { fetchAllPickupPoint, fetchAllGuige } from '../../../service/global';
import { fetchStoreCenterCreate, fetchStoreCenterEdit, fetchStoreCenterDetail } from '../../../service/storecenter';
import { form, delay, createGuid, goBackAndRefresh } from '../../../utils/tools';

/*
提货点1号店
长河街道和平广场118号
猪小明
18069886088
润土
18069886011
中国农业银行
6242821234567890000
*/

Page({
	data: { // 以下所有格式化数据都同接口返回 keyName 保持一直
		type: '', // create/edit
		fromto: '', // 值为 personal 表示个人中心编辑资料，否则就是不存在
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

		guigeList.forEach((item) => { // 用于添加提货点 { spec: 1, spec_name: "食品粮油", freight_rate: '运费比例' }
			newGuigeList.push({ spec: item['id'], spec_name: item['name'], freight_rate: '' });
		});
		
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
	getZhuguanFormValues() {
		const { zhuguanList } = this.data;
		const formIds = [];
		zhuguanList.forEach((item) => {
			formIds.push(`formZhuguanName_${item['id']}`);
			formIds.push(`formZhuguanPhone_${item['id']}`);
		});

		const newList = []; // 格式化后的主管数据 []
		const formValues = form.validateFields(this, formIds);
		if(formValues) {			
			zhuguanList.forEach((item) => {
				const director = formValues[`director__${item['id']}`];
				const director_phone = formValues[`director_phone__${item['id']}`];
				newList.push({ id: item['id'], director, director_phone });
			});
		}
		
		return newList;
	},
	// 所属提货点事件
	onAddTihuodian() {
		const { allGuigeList } = this.data;
		const newActionItem = { actype: 'create', spec_rate_list: allGuigeList };
		this.setData({ visible: true, actionItem: newActionItem });
	},
	onEditTihuodian(e) {
		const { allGuigeList } = this.data;
		const { item } = e.currentTarget.dataset;
		const guigeValues = item['spec_rate_list'] || [];

		if(guigeValues.length <= 0) { // 异常情况
			item['spec_rate_list'] = allGuigeList;
		}else{ // 编辑老数据时候，应把新增加的规格信息添加进去
			const newList = [];
			allGuigeList.forEach((listItem) => {
				const findItem = guigeValues.find((valItem) => valItem['spec'] == listItem['spec']);
				newList.push(findItem || listItem);
			});

			item['spec_rate_list'] = newList;
		}

		this.setData({ visible: true, actionItem: { ...item, actype: 'edit', } });
	},
	onPopupSure() { // 添加/编辑提货点弹窗确认动作
		//
		const { allPickupList, tihuodianList, actionItem } = this.data;

		// 获取提货点信息
		const formIds = ['formInputTihuodian', 'formInputReachTime', 'formInputClosed', 'formInputCardNum', 'formInputCancelRate', 'formInputLastTime'];
		actionItem['spec_rate_list'].forEach((item, index) => formIds.push(`formInputGuige__${index + 1}`));
		const formValues = form.validateFields(this, formIds);

		if(formValues) {
			// 添加提货点名称
			const pickupIndex = allPickupList.findIndex((item) => item['value'] == formValues['point_id']);
			formValues['point_name'] = allPickupList[pickupIndex]['label'];

			// 禁用添加的提货点
			const newPickupItem = { ...allPickupList[pickupIndex], disabled: true };
			allPickupList.splice(pickupIndex, 1, newPickupItem);

			// 格式化成表单提交数据
			const newFormValues = { spec_rate_list: [] };
			Object.keys(formValues).forEach((keyName) => {
				if(keyName.includes('__')) { // 规格类别运费数据
					const thisArray = keyName.split('__');
					newFormValues['spec_rate_list'].push({ spec: Number(thisArray[1]), spec_name: thisArray[2], freight_rate: formValues[keyName] });
				}else{
					newFormValues[keyName] = formValues[keyName];
				}
			});

			if(actionItem['id']) { // 编辑
				const thisIndex = tihuodianList.findIndex((item) => item['id'] == actionItem['id']);
				tihuodianList.splice(thisIndex, 1, { ...newFormValues, id: actionItem['id'] });
			}else{
				tihuodianList.push({ ...newFormValues, id: createGuid(6) });
			}
			
			this.setData({ tihuodianList, allPickupList, visible: false });
		}
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
	// 保存提交
	async onSave() {
		//
		const { defaultValues, tihuodianList, type } = this.data;

		// 获取主管数据
		const zhuguanList = this.getZhuguanFormValues();

		const formValues = form.validateFields(this); // 表单是 class 的值，不包括主管和提货点
		if(formValues) {
			if(zhuguanList.length <= 0) {
				wx.showToast({ title: '请添加主管信息', icon: 'error' });
				return false;
			}

			if(tihuodianList.length <= 0) {
				wx.showToast({ title: '请添加提货点', icon: 'error' });
				return false;
			}

			if(type === 'edit') {
				formValues['id'] = defaultValues['id'];
			}

			formValues['director_list'] = zhuguanList;
			formValues['pickup_points'] = tihuodianList;
			formValues['address'] = JSON.stringify(formValues['address']);

			const result = type == 'edit' ? (await useRequest(() => fetchStoreCenterEdit(formValues))) : (await useRequest(() => fetchStoreCenterCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				wx.navigateBack({ delta: 1, success: () => {
					const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
					eventChannel.emit('acceptOpenedData', type == 'edit' ? result : {});
				}});
			}
		}
	},
	async onLoad({ type, strItem, fromto }) { // type: create/edit; fromto 值存在表示从集货中心负责人登录->个人中心->编辑资料跳过来，否则不存在
		if(type == 'edit') {
			const jsonItem = JSON.parse(strItem);
			const result = await useRequest(() => fetchStoreCenterDetail({ id: jsonItem['id'] }));
			if(result) {
				// 所在地区
				result['address'] = JSON.parse(result['address']);
				
				// 主管和提货点赋值数据
				const zhuguanList = result['director_list'];
				const tihuodianList = result['pickup_points'];

				this.setData({ type, defaultValues: result, zhuguanList, tihuodianList, fromto });
				this.onAllList(type, result); // 获取提货点和规格下拉列表数据
			}
		}else{
			// 主管和提货点数据
			const zhuguanList = [{ id: createGuid(6), director: '', director_phone: '' }];
			const tihuodianList = [];
			
			this.setData({ type, defaultValues: {}, zhuguanList, tihuodianList });
			this.onAllList(type, {}); // 获取提货点和规格下拉列表数据
		}
	}
})