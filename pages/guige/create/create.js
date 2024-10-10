import useRequest from '../../../utils/request';
import { fetchGuigeCreate, fetchGuigeEdit } from '../../../service/guige';
import { form, createGuid, delay, goBackAndRefresh } from '../../../utils/tools';

Page({
	data: {
		type: '', // create/edit
		visible: false, // 是否显示弹窗		
		itemId: '', // 列表中编辑的某项
		guigeList: [], // 规格列表表单的值，用于提交
		listItem: { name: '', freight: '', weight: '' }, // guigeList某个值，用于赋值弹窗中 form 值
	},
	onPopupShow() { // 点击添加显示弹窗
		this.setData({ visible: true, listItem: {} });
	},
	onPopupSure() { // 新增：弹窗确定
		const { guigeList, listItem } = this.data;
		const formValue = form.validateFields(this, ['formInputName', 'formInputFreight', 'formInputWeight']);
		if(formValue) {
			if(listItem['id']) { // 编辑
				const thisIndex = guigeList.findIndex((item) => item['id'] == listItem['id']);
				const newList = guigeList.slice();
				newList.splice(thisIndex, 1, { id: listItem['id'], ...formValue });
				this.setData({ guigeList: newList, visible: false });
			}else{ // 新增
				const id = createGuid(6);
				const newList = [].concat(guigeList, [{ id, ...formValue }]);
				this.setData({ guigeList: newList, visible: false });
			}
		}
	},
	onEdit(e) {
		const thisItem = e.currentTarget.dataset.item;
		this.setData({ visible: true, listItem: thisItem });
	},
	onDelete(e) {
		const { guigeList } = this.data;
		const thisId = e.currentTarget.dataset.id;
		const thisIndex = guigeList.findIndex((item) => item['id'] == thisId);
		const newList = guigeList.slice();
		newList.splice(thisIndex, 1);
		this.setData({ guigeList: newList });
	},
	async onSave() { // 保存
		const category = form.getFieldValue(this, 'formInputCategory'); // 类别名称
		if(category) {
			const { type, itemId, guigeList } = this.data;
			if(guigeList.length <= 0) {
				wx.showToast({ title: '请添加规格信息', icon: 'error' });
				return false;
			}

			// 只要是新增的规格，id就去掉，后台小白程序设计的
			const newList = guigeList.map((item) => {
				if(typeof item['id'] == 'string') {
					delete item['id'];
				}

				return item;
			});
	
			const formValues = type == 'edit' ? { id: itemId, category, list: newList } : { category, list: newList };
			const result = type == 'edit' ? (await useRequest(() => fetchGuigeEdit(formValues))) : (await useRequest(() => fetchGuigeCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);

				wx.navigateBack({ delta: 1, success: () => {
					const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
					eventChannel.emit('acceptOpenedData', {});
				}});
			}
		}
	},
	onLoad({ type, strItem }) { // type: create/edit
		const jsonItem = JSON.parse(strItem);
		if(type == 'create') {
			this.setData({ type });
		}else{
			form.setFieldValue(this, 'formInputCategory', jsonItem['name']);
			this.setData({ type, itemId: jsonItem['id'], guigeList: jsonItem['list'] });
		}
	}
})