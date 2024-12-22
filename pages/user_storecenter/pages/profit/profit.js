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
		// 总件数、总收益
		allJianshu: '-/-',
		allProfit: '-/-',
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
	// 调用子组件方法
	childComponentCallback() {
		const { roleType, userId } = this.data;
		const childComponentId = roleType == 7 ? '#templateProfitUser' : (userId == 'all' ? '#templateProfitAll' : '#templateProfitUser');
		const childComponent = this.selectComponent(childComponentId);
		childComponent.onAjaxList(1, (params) => {
			this.setData({ allJianshu: params['allJianshu'], allProfit: params['allProfit'] });
		});		
	},
	// 筛选条件
	onRadioChange(e) {
		const { value } = e.detail;
		this.setData({ radioValue: value });
	},
	onMonth(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ monthValue: value });

		// 调用子组件方法
		this.childComponentCallback();
	},
	onQujian(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ qujianValue: value });
		
		// 调用子组件方法
		this.childComponentCallback();
	},
	onSelectUser(e) { // 选择分拣员
		const { label, value } = e.detail;
		this.setData({ userId: value, userName: label });
		
		// 调用子组件方法
		this.childComponentCallback();
	},	
	onLoad(options) {
		const userInfo = app.userInfo;
		const currentMonth = getCurrentDateTime('YYYY-MM');
		this.setData({ roleType: userInfo['role_type'], monthValue: currentMonth });

		// 列表请求 - 调用子组件方法，子组件 lifetimes.attached 先执行父组件 onLoad 后执行
		this.childComponentCallback();

		// 5 集货中心负责人；6 集货中心主管
		if([5, 6].includes(userInfo['role_type'])) {
			this.getAllUsers();
		}
	}
})