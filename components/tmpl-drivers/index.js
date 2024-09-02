import useRequest from '../../utils/request';
import { fetchAllCars, fetchAllStoreCenter, fetchPickupFromCenter } from '../../service/global';
import { form, delay, createGuid } from '../../utils/tools';

Component({
	properties: {
		actionType: { type: String, value: 'signup' }, // 注册(signup)/审核(audit)/创建(create)/编辑(edit)
		defaultValues: { type: Object, value: {} },
		phone: { type: String, value: '' }, // 只有 signup 时使用
	},
	data: {
		carOptions: [],
		centerOptions: [],
		pickupOptions: [], // 集货中心下的提货点
		// 支付类型
		payType: 1,
		paytypeOptions: [{ label: '固定工价', value: 1 }, { label: '运费系数', value: 2 }],
	},
    // 监听 properties 值变化
    observers: {
        defaultValues: function(values) { // 监听外部传递的 value
			this.setData({ payType: values['pay_type'] || 1 });
        }
    },
	methods: {
		async onSelectCenter(e) { // 选择激活中心后的回调，去匹配下面的提货点
			const { label, value } = e.detail;
			const dataList = await useRequest(() => fetchPickupFromCenter({ id: value }));
			if(dataList) { // { label: '', value: '' }
				const newList = dataList.map((item) => ({ label: item['name'], value: item['point_id'] }));
				this.setData({ pickupOptions: newList });
			}
		},
		onPaytype(e) { // 支付类型的回调
			const { value } = e.detail;
			this.setData({ payType: value });
		},
		getFormValues() {
			const formValues = form.validateFields(this);
			formValues['address'] = JSON.stringify(formValues['address']);
			return formValues;
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		async attached() { // 组件完全初始化完毕
			const carList = await useRequest(() => fetchAllCars());
			const centerList = await useRequest(() => fetchAllStoreCenter());

			// 格式化车辆类型列表
			const newCarList = [];
			(carList || []).forEach((item) => { // { label: '', value: '' }
				newCarList.push({ label: item['name'], value: item['type'] });
			});

			// 格式化集货中心
			const newCenterList = [];
			(centerList || []).forEach((item) => { // { label: '', value: '' }
				newCenterList.push({ label: item['name'], value: item['id'] });
			});

			this.setData({ carOptions: newCarList, centerOptions: newCenterList });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})