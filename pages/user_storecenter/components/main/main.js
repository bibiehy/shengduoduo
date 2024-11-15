import useRequest from '../../../../utils/request';
import { delay, form, getCurrentDateTime } from '../../../../utils/tools';
import { fetchMainList, fetchSureLanjian } from '../../../../service/user_storecenter';

// 获取 app 实例
const app = getApp();

Component({
	data: {
		roleType: '', // 如果是分拣员不显示确认揽件
		dataList: [],
		// 过滤条件
		visible: false,
		// 确认弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base', loading: false },
		actionItem: {},
	},
	methods: {
		// 待揽件任务列表
        async getDailjTask(params) {
			wx.showLoading();
			await delay(500);
			const result = await useRequest(() => fetchMainList(params));
			wx.hideLoading();
			if(result) {
				this.setData({ dataList: result['content'] });
			}
        },
        onShowPopup() { // 
            this.setData({ visible: true });
		},
		onFilter() {
			const formValues = form.getFieldsValue(this);
			formValues['task_no'] = formValues['task_no'] || '';
			this.setData({ visible: false });
			this.getDailjTask(formValues);
		},
		onSearchBar() { // 点击导航栏任务查询跳转到任务管理
			this.triggerEvent('onSearchBar');
		},
		// 确认揽件
		onShowDialog(e) {
			const { item } = e.currentTarget.dataset;
			this.setData({ showConfirm: true, actionItem: item });
		},
		onCancelDialog() {
			this.setData({ showConfirm: false });
		},
		async onSureDialog() {
			const { actionItem } = this.data;
			const result = await useRequest(() => fetchSureLanjian({ id: actionItem['id'] }));
			if(result) {
				this.setData({ showConfirm: false, actionItem: {} });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
				this.getDailjTask();
			}
		},
		// 查看详情
		onDetail(e) {
			const { item } = e.currentTarget.dataset;
			if(item['status'] == 2) {
				wx.navigateTo({ url: `/pages/user_storecenter/pages/fenjian_detail/fenjian_detail?actionType=view&id=${item['id']}` });
			}
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached(options) { // 组件完全初始化完毕
			this.setData({ roleType: app['userInfo']['role_type'] });
			this.getDailjTask();
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})