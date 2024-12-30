import useRequest from '../../../../utils/request';
import { delay, form, getCurrentDateTime } from '../../../../utils/tools';
import { fetchMainProfit, fetchCurrentTask, fetchAcceptTask, fetchFache, fetchTaskComplete } from '../../../../service/user_driver';

// 获取 app 实例
const app = getApp();

Component({
	data: {
		userInfo: {},
		weekSummary: 0, // 本周收益
		monthSummary: 0, // 本月收益
		dataList: [],
        // 确认弹窗
		showConfirm: false,
        confirmBtn: { content: '确定', variant: 'base', loading: false },
		actionItem: {},
	},
	methods: {
		// 面板收益统计
		async getProfitPanel() {
			const result = await useRequest(() => fetchMainProfit());
			if(result) {
				// item['address'] = JSON.parse(item['address']);
				// item['addressStr'] = (item['address'].map((adItem) => adItem['label'])).join('、');
				// region
				this.setData({ weekSummary: result['profit'], monthSummary: result['month_profit'] });
			}
		},
		// 获取当前任务
        async getCurrentTask() {
			const result = await useRequest(() => fetchCurrentTask());
			if(result) {
				this.setData({ dataList: result });
			}
		},
		// 弹窗：确认送达
		onShowDialog(e) {
			const { item } = e.currentTarget.dataset;
			this.setData({ showConfirm: true, actionItem: item });
		},
		onCancelDialog() {
			this.setData({ showConfirm: false, actionItem: item });
		},
		async onSureDialog() {
			const { actionItem } = this.data;
			const result = await useRequest(() => fetchSureLanjian({ id: actionItem['id'] }));
			if(result) {
				this.setData({ showConfirm: false, actionItem: '' });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
				this.getDailjTask();
			}
		},
		// 上报
		onReport() {
			wx.navigateTo({ url: `/pages/user_driver/pages/exception_report/exception_report` });
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached(options) { // 组件完全初始化完毕
			this.setData({ userInfo: app['userInfo'] });
			this.getProfitPanel();
			this.getCurrentTask();
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})