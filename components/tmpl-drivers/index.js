import useRequest from '../../utils/request';
import { fetchAllCars, fetchAllStoreCenter, fetchPickupFromCenter } from '../../service/global';
import { form, delay, createGuid } from '../../utils/tools';
import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';

// ActionSheet
let actionSheetHandler = '';
const getActionSheetOptions = (that, args) => {
	const { id, name, biaoshi } = args;
	const moveupDisabled = biaoshi == 'all' ? true : (biaoshi == 'moveup');
	const movedownDisabled = biaoshi == 'all' ? true : (biaoshi == 'movedown');
	const moveupColor = moveupDisabled ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.9)';
	const movedownColor = movedownDisabled ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.9)';

	return {
		theme: ActionSheetTheme.List,
		selector: '#actionSheetDrivers',
		context: that,
		description: name,
		items: [
			{ id, name, label: '删除', type: 'delete', disabled: false, color: 'rgba(0, 0, 0, 0.9)' },
			{ id, name, label: '上移', type: 'moveup', disabled: moveupDisabled, color: moveupColor },
			{ id, name, label: '下移', type: 'movedown', disabled: movedownDisabled, color: movedownColor },
		]
	};
};

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
		routeList: [], // 添加的路线信息
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
		async onSelectCenter(e) { // 选择激活中心后的回调，去匹配下面的提货点或编辑时候父组件调用
			const { label, value, expectList } = e.detail;
			const dataList = await useRequest(() => fetchPickupFromCenter({ id: value }));
			if(dataList) { // { label: '', value: '' }
				const newList = dataList.map((item) => ({ label: item['name'], value: item['point_id'] }));
				this.setData({ pickupOptions: newList, routeList: expectList || [] });
			}
		},
		onAddSure(e) { // 添加路线
			const { label, value } = e.detail;
			const { pickupOptions, routeList } = this.data;
			const thisIndex = pickupOptions.findIndex((item) => item['value'] == value);
			const thisItem = pickupOptions[thisIndex];

			// 删除添加过的提货点
			pickupOptions.splice(thisIndex, 1);

			// 添加路线信息
			routeList.push({ point_id: thisItem['value'], point_name: thisItem['label'], cost: '' });

			this.setData({ pickupOptions, routeList });
		},
		onActionSheet(e) { // 显示 ActionSheet
			const { routeList } = this.data;
			const { id, name, index } = e.currentTarget.dataset;
			const biaoshi = routeList.length == 1 ? 'all' : (index == 0 ? 'moveup' : (index == routeList.length - 1 ? 'movedown' : ''));
			const actionSheetOptions = getActionSheetOptions(this, { id, name, biaoshi });
			ActionSheet.show(actionSheetOptions);
		},
		onHandlerSelected(e) {
			const { index, selected } = e.detail;

			if(selected['disabled']) {
				return false;
			}

			if(selected['type'] == 'delete') {
				this.onDelete(selected);
			}else{
				this.onMoveUpDown(selected);
			}
		},
		onDelete(thisItem) {
			const { id, name } = thisItem;
			const { pickupOptions, routeList } = this.data;

			// 恢复提货点
			pickupOptions.push({ label: name, value: id });

			// 删除 routeList
			const routeIndex = routeList.findIndex((item) => item['point_id'] == id);
			routeList.splice(routeIndex, 1);

			this.setData({ pickupOptions, routeList });
		},
		onMoveUpDown(thisItem) {
			const { id, name, type } = thisItem;
			const { routeList } = this.data;
			const routeIndex = routeList.findIndex((item) => item['point_id'] == id);
			const [removeItem] = routeList.splice(routeIndex, 1);
			const spliceIndex = type == 'moveup' ? (routeIndex - 1) : (routeIndex + 1);
			routeList.splice(spliceIndex, 0, removeItem);

			this.setData({ routeList });
		},
		onBlurCost(e) { // 期望单趟费用，失去焦点
			const { name, value } = e.detail;
			const { routeList } = this.data;
			const pointId = name.split('__')[0];
			const thisIndex = routeList.findIndex((item) => item['point_id'] == pointId);
			const thisItem = { ...routeList[thisIndex], cost: value };
			routeList.splice(thisIndex, 1, thisItem);

			this.setData({ routeList });
		},
		onPaytype(e) { // 支付类型的回调
			const { value } = e.detail;
			this.setData({ payType: value });
		},
		getFormValues() {
			const { routeList } = this.data;

			// 表单的值
			const formValues = form.validateFields(this);
			if(formValues) {
				if(routeList.length <= 0) {
					wx.showToast({ title: '请添加路线信息', icon: 'error' });
				}else{
					formValues['expect_route_list'] = routeList;
				}
			}

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