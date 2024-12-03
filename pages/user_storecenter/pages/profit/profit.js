import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchAllFenjianyuan, fetchProfitList } from '../../../../service/user_storecenter';

// 获取 app 实例
const app = getApp();

Page({
	data: {
		// 角色类型，5 集货中心负责人；6 集货中心主管；7 分拣员
		roleType: '',
		// 筛选条件
		radioValue: 'month', // 类别：月份、区间
		monthValue: '',
		qujianValue: [],
		userId: 'all',
		userName: '全部',
		allUsers: [], // 所有分拣员
		//
		allJianshu: '-/-',
		allProfit: '-/-',
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
	},
	// 列表请求
	async onAjaxList(thisPage, callback) {
		const { radioValue, monthValue, qujianValue, userId, dataList, upStatus } = this.data;
		const params = { page: thisPage, sorter: userId == 'all' ? null : userId };

		if(radioValue == 'month') {
			params['month'] = monthValue;
		}else if(radioValue == 'range') {
			params['beginTime'] = qujianValue[0];
			params['endTime'] = qujianValue[1];
		}

		const result = await useRequest(() => fetchProfitList(params));
		if(result) {
			// upStatus == 2 表示上拉加载，数据许合并
			const allJianshu = result['custom_data']['total_num'];
			const allProfit = result['custom_data']['total_profit'];
			const newList = upStatus == 2 ? [].concat(dataList, result['content']) : result['content'];
			this.setData({ allJianshu, allProfit, currentPage: thisPage, dataList: newList });

			if(Object.prototype.toString.call(callback) == '[object Function]') {
				callback(result['content']);
			}
		}
	},	
	onRefresh() { // 下拉刷新
		this.setData({ downStatus: true });
		this.onAjaxList(1, async () => {
			await delay(500);
			this.setData({ downStatus: false });
		});
	},
	onPullUpLoaded(e) { // 上拉加载
		const { currentPage, upStatus } = this.data;
		if(upStatus == 2 || upStatus == 3) { // 加载中或已全部加载
			return false;
		}

		const nextPage = currentPage + 1;
		this.setData({ upStatus: 2 });
		this.onAjaxList(nextPage, (currentList) => {
			this.setData({ upStatus: currentList.length <= 0 ? 3 : 1 });
		});
	},
	// 获取所有的分拣员
	async getAllUsers() {
		const { roleType } = this.data;
		const result = await useRequest(() => fetchAllFenjianyuan());
		if(result) {
			const newList = [{ label: '全部', value: 'all' }];
			if(roleType == 6) { // 6 集货中心主管
				newList.push({ label: '我的', value: app['userInfo']['id'] });
			}

			result.forEach((item) => newList.push({ label: `${item['username']}(${item['phone']})`, value: item['id'] }));
			this.setData({ allUsers: newList });
		}
	},
	// 筛选条件
	onRadioChange(e) {
		const { value } = e.detail;
		this.setData({ radioValue: value });
	},
	onMonth(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ monthValue: value });
		this.onAjaxList(1);
	},
	onQujian(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ qujianValue: value });
		this.onAjaxList(1);
	},
	onSelectUser(e) {
		const { label, value } = e.detail;
		this.setData({ userId: value, userName: label });
		this.onAjaxList(1);
	},	
	onLoad(options) {
		const userInfo = app.userInfo;
		const currentMonth = getCurrentDateTime('YYYY-MM');
		this.setData({ roleType: userInfo['role_type'], monthValue: currentMonth });

		// 列表请求
		this.onAjaxList(1);

		// 5 集货中心负责人；6 集货中心主管
		if([5, 6].includes(userInfo['role_type'])) {
			this.getAllUsers();
		}
	}
})