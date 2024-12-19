import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
import useRequest from '../../../../utils/request';
import { fetchDiverGaikuang } from '../../../../service/drivers';
import { form, delay, getCurrentDateTime } from '../../../../utils/tools';

// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
        centerList: [],
		centerSelected: {},
        radioChecked: 'date', // 配送概况：date 日期，all 全部
        monthVisible: false,
        monthValue: '', // 2024-09
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
			const { centerSelected, radioChecked, monthValue, dataList, upStatus } = this.data;
			const dateMonth = radioChecked == 'date' ? monthValue : ''; // all 时传空
			const result = await useRequest(() => fetchDiverGaikuang({ page: thisPage, center_id: centerSelected['value'], month: dateMonth }));
			if(result) {
				// upStatus == 2 表示上拉加载，数据许合并
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
        // 配送概况：date 日期，all 全部
        onPeisongRadio(e) {
            const { value } = e.currentTarget.dataset;
            if(value == 'date') {
                this.setData({ radioChecked: value, monthVisible: true });
            }else{ // all
                this.setData({ radioChecked: value });
                this.onAjaxList(1);
            }            
        },
        onHideMonth() {
            this.setData({ monthVisible: false });
        },
        onConfirmMonth(e) {
            const { value } = e.detail;
            this.setData({ monthVisible: false, monthValue: value });
            this.onAjaxList(1);
        },
        // 选择集货中心
		onShowCenter() {
			const { centerList } = this.data;
			ActionSheet.show({
				theme: ActionSheetTheme.List,
				selector: '#jihuoCenterActionSheet',
				context: this,
				description: '请选择集货中心',
				items: centerList
			});
		},
		onCenterSelected(e) {
			const { selected } = e.detail;
			const { centerSelected } = this.data;

			if(selected['value'] == centerSelected['value']) {
				return false;
			}

			// 把集货中心信息存在本地
			this.setData({ centerSelected: selected });
			this.onAjaxList(1);
        },        
    },
    lifetimes: {
		attached() { // 组件完全初始化完毕
			const userInfo = app['userInfo']; // 返回调度管理员所分配的集货中心信息
			const centerList = userInfo['center_list'].map((item) => ({ label: item['name'], value: item['id'] }));
            const defaultCenter = JSON.parse(wx.getStorageSync('DIAODU_MAIN_CENTER') || JSON.stringify(centerList[0]));
            const thisMonth = getCurrentDateTime('YYYY-MM');
			
			this.setData({ centerList, centerSelected: defaultCenter, monthValue: thisMonth });
			this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})