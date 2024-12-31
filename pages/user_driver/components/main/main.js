import useRequest from '../../../../utils/request';
import { delay, form, getCurrentDateTime } from '../../../../utils/tools';
import { fetchMainProfit, fetchCurrentTask, fetchReciveTask, fetchFache, fetchTaskComplete } from '../../../../service/user_driver';

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
				this.setData({ weekSummary: result['profit'], monthSummary: result['month_profit'] });
			}
		},
		// 获取当前任务
        async getCurrentTask() {
			const result = await useRequest(() => fetchCurrentTask());
			if(result) {
                result.forEach((item) => {
                    item['address'] = JSON.parse(item['address']);
                    item['addressStr'] = (item['address'].map((adItem) => adItem['label'])).join('、') + item['region'];
                    item['cardStr'] = item['card_list'].join('、');
                });
				this.setData({ dataList: result });
			}
        },
        // 按钮操作
        async onReciveMessage(e) { // 已收到通知
            const { dataList } = this.data;
            const result = await useRequest(() => fetchReciveTask());
            if(result) {
                this.getCurrentTask();
            }
        },
        async onFache(e) { // 发车
            const { dataList } = this.data;
            const result = await useRequest(() => fetchFache());
            if(result) {
                this.getCurrentTask();
            }
        },
        async onSureSongda(e) { // 确认送达
            const { dataList } = this.data;
            const result = await useRequest(() => fetchTaskComplete());
            if(result) {
                this.getCurrentTask();
            }
        },
		onShowDialog(e) { // 弹窗：确认送达
			const { item } = e.currentTarget.dataset;
			this.setData({ showConfirm: true, actionItem: item });
		},
		onCancelDialog() {
			this.setData({ showConfirm: false, actionItem: item });
		},
		async onSureDialog() {
			const { actionItem } = this.data;
			const result = await useRequest(() => fetchTaskComplete({ id: actionItem['id'] }));
			if(result) {
				this.setData({ showConfirm: false, actionItem: '' });
				this.getCurrentTask();
			}
		},
		onReport() { // 异常上报
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