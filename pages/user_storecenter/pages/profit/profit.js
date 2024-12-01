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
		monthValue: '',
		qujianValue: [],
		// 日期类别：按月份、按区间
		pickerVisible: false,
		pickerValue: 'month',
		datePickerOptions: [{ label: '按月份', value: 'month' }, { label: '按区间', value: 'range' }],
	},
	// 日期类别
	onShowPicker() {
		this.setData({ pickerVisible: true });
	},
	onPickerConfirm(e) { // 选择月份获区间
		const { value } = e.detail;
		this.setData({ pickerValue: value });
	},
	onPickerCancel() {
		this.setData({ pickerVisible: false });
	},
	// 月份选择的回调
	onMonth(e) {
		const { value } = e.detail;
		this.setData({ monthValue: value }); // 为了切换时候显示
	},
	onLoad(options) {
		const userInfo = app.userInfo;
		this.setData({ roleType: userInfo['role_type'] });
	}
})