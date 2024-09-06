import useRequest from '../../utils/request';
import { fetchAllStoreCenter, fetchAllGuige } from '../../service/global';
import { form, delay, createGuid } from '../../utils/tools';

Component({
	properties: {
		actionType: { type: String, value: 'signup' }, // 注册(signup)/审核(audit)/创建(create)/编辑(edit)
		defaultValues: { type: Object, value: {} },
		phone: { type: String, value: '' }, // 只有 signup 时使用
	},
	data: {
		centerOptions: [],
		guigeOptions: []
	},
	methods: {
		getFormValues() {
			const formValues = form.validateFields(this);
			if(formValues) {
				formValues['address'] = JSON.stringify(formValues['address']);
			}
			
			return formValues;
		},
		getFormValuesUnverified() { // 审核拒绝时调用
			const formValues = form.getFieldsValue(this);
			formValues['address'] = JSON.stringify(formValues['address']);
			return formValues;
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		async attached() { // 组件完全初始化完毕
			const centerList = await useRequest(() => fetchAllStoreCenter());
			const guigeList = await useRequest(() => fetchAllGuige());

			// 格式化集货中心
			const newCenterList = [];
			(centerList || []).forEach((item) => { // { label: '', value: '' }
				newCenterList.push({ label: item['name'], value: item['id'] });
			});

			// 格式化规格类别列表
			const newGuigeList = [];
			(guigeList || []).forEach((item) => { // { label: '', value: '' }
				newGuigeList.push({ label: item['name'], value: item['id'] });
			});

			this.setData({ centerOptions: newCenterList, guigeOptions: newGuigeList });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})