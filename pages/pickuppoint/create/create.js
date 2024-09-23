import useRequest from '../../../utils/request';
import { fetchPickupCreate, fetchPickupEdit } from '../../../service/pickuppoint';
import { form, delay, goBackAndRefresh } from '../../../utils/tools';

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
	data: {
		type: '', // create/edit
		defaultValues: {}, // 编辑时使用
	},
	async onSave() { // 保存
		const { defaultValues } = this.data;
		const formValues = form.validateFields(this);
		if(formValues) {
			const { type } = this.data;
			if(type === 'edit') {
				formValues['id'] = defaultValues['id'];
			}

			formValues['address'] = JSON.stringify(formValues['address']);

			const result = type == 'edit' ? (await useRequest(() => fetchPickupEdit(formValues))) : (await useRequest(() => fetchPickupCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				goBackAndRefresh(type, result); // 返回父页面并调用父页面的 onRefresh 方法，当 type=edit 时才使用 result
			}
		}
	},
	onLoad({ type, strItem }) { // type: create/edit
		const jsonItem = JSON.parse(strItem || "{}");
		
		// jsonItem['address'] = [
		// 	{label: "河北省", value: "130000"},
		// 	{label: "石家庄市", value: "130100"},
		// 	{label: "长安区", value: "130102"}
		// ];

		this.setData({ type, defaultValues: jsonItem });
	}
})