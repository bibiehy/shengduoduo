import useRequest from '../../../../utils/request';
import { delay } from '../../../../utils/tools';
import { fetchProfitList } from '../../../../service/user_storecenter';

Component({
	properties: {
		visible: { type: Boolean, value: false },
		radioValue: { type: String, value: 'month' },
		monthValue: { type: String, value: '' },
		qujianValue: { type: Array, value: [] },
	},
	data: {
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
	},
	methods: {
		// 列表请求
		async onAjaxList(thisPage, callback) {
			const { radioValue, monthValue, qujianValue, dataList, upStatus } = this.data;
			const params = { page: thisPage, sorter: null };

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
				this.setData({ currentPage: thisPage, dataList: newList });

				if(Object.prototype.toString.call(callback) == '[object Function]') {
					callback({ allJianshu, allProfit, currentList: result['content'] });
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
			this.onAjaxList(nextPage, ({ currentList }) => {
				this.setData({ upStatus: currentList.length <= 0 ? 3 : 1 });
			});
		},
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})