import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchProfitList } from '../../../../service/user_driver';

// 获取 app 实例
const app = getApp();

Page({
	data: {
        currentPage: 1,
		dataList: [],
        // 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
        upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
		// 筛选条件
		radioValue: 'month', // 类别：月份、区间
		monthValue: '',
		qujianValue: [],
		// 总次数、总收益
		allCishu: '-/-',
		allProfit: '-/-',
    },	
    // 列表
    async onAjaxList(thisPage, callback) { // 列表请求
        const { dataList, upStatus, radioValue, monthValue, qujianValue } = this.data;
        const params = { page: thisPage };
        if(radioValue == 'month') {
            params['month'] = monthValue;
        }else if(radioValue == 'range') {
            params['beginTime'] = qujianValue[0];
            params['endTime'] = qujianValue[1];
        }

        const result = await useRequest(() => fetchProfitList(params));
        if(result) {
            // upStatus == 2 表示上拉加载，数据许合并
            // const allJianshu = result['custom_data']['total_num'];
            // const allProfit = result['custom_data']['total_profit'];
            const newList = result['content'];
            this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList });

            if(Object.prototype.toString.call(callback) == '[object Function]') {
                callback(newList);
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
	// 筛选条件
	onRadioChange(e) {
		const { value } = e.detail;
		this.setData({ radioValue: value });
	},
	onMonth(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ monthValue: value });

		// 请求
		this.onAjaxList(1);
	},
	onQujian(e) { // 月份选择的回调
		const { value } = e.detail;
		this.setData({ qujianValue: value });
		
		// 调用子组件方法
		this.onAjaxList(1);
	},
	onLoad(options) {
		const userInfo = app.userInfo;
		const currentMonth = getCurrentDateTime('YYYY-MM');
        this.setData({ roleType: userInfo['role_type'], monthValue: currentMonth });
        this.onAjaxList(1);
	}
})