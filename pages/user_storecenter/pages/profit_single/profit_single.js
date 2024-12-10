import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchAllFenjianyuan, fetchProfitList } from '../../../../service/user_storecenter';

Page({
	data: {
		baseInfo: {},
		radioValue: '',
		monthValue: '',
		qujianValue: [],
		userId: '',
		title: '',
		tongjiDate: '',
	},
	onLoad({ strItem }) {
		//
		const { radioValue, monthValue, qujianValue, ...restItem } = JSON.parse(strItem);
		const title = `${restItem['username']}的收益`;
		const tongjiDate = radioValue == 'month' ? monthValue : `${qujianValue[0]} ~ ${qujianValue[1]}`;
		this.setData({ baseInfo: restItem, radioValue, monthValue, qujianValue, userId: restItem['sorter'], title, tongjiDate });

		// 调用子组件方法
		const childComponent = this.selectComponent('#templateProfitUser');
		childComponent.onAjaxList(1);	
	}
})