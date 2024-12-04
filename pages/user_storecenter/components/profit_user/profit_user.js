import useRequest from '../../../../utils/request';
import { delay } from '../../../../utils/tools';
import { fetchProfitList } from '../../../../service/user_storecenter';

Component({
	properties: {
		visible: { type: Boolean, value: false },
		radioValue: { type: String, value: 'month' },
		monthValue: { type: String, value: '' },
		qujianValue: { type: Array, value: [] },
		userId: { type: Number, value: '' },
	},
	data: {
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载

		testItem: {
			type: '', // 区分是分拣收益还是异常上报
			status: '', // 1.分拣收益时为任务的状态 2.异常收益时为审核状态(审核中/已拒绝/已同意)
			name: '', // 任务名字
			created_at: '', // 1.分拣收益时为创建任务时间 2.异常收益时为异常上报时间
			create_username: '', // 发货人姓名
			create_phone: '', // 发货人电话
			goods_type_name: '', // 规格类别，如蔬菜类，指任务规格类别或异常上报类别
			spec_name: '', // 异常上报规格，如1-10斤
			total_num: '', // 分拣收益总件数
			total_profit: '', // 预估总收益，指分拣收益或异常收益
			reason: '', // 异常上报管理拒绝原因或通过描述
		}
	},
	methods: {
		// 列表请求
		async onAjaxList(thisPage, callback) {
			const { radioValue, monthValue, qujianValue, userId, dataList, upStatus } = this.data;
			const params = { page: thisPage, sorter: userId };

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