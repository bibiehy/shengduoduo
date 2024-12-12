import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';  

Component({
	properties: {
		
	},
	data: {
		centerSelected: { label: '粤西农批57号仓', value: 57 },
		keyword: '',
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
	},
	methods: {
		// 
		async onAjaxList(thisPage, callback) { // 列表请求
			const { centerSelected, keyword, dataList, upStatus } = this.data;
			// const result = await useRequest(() => fetchFenList({ page: thisPage, keyword: keyword || '' }));
			// if(result) {
			// 	// upStatus == 2 表示上拉加载，数据许合并
			// 	const newList = result['content'];
			// 	this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList });

			// 	if(Object.prototype.toString.call(callback) == '[object Function]') {
			// 		callback(newList);
			// 	}
			// }
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
		// 搜索
		onSearchChange(e) { // 更新搜索关键字
			const targetValue = e.detail.value;
			this.setData({ keyword: targetValue });
		},
		onSearch() { // 搜索
			this.onAjaxList(1);
		},
		// 选择集货中心
		onShowCenter() {
			ActionSheet.show({
				theme: ActionSheetTheme.List,
				selector: '#jihuoCenterActionSheet',
				context: this,
				description: '请选择集货中心',
				items: [{ label: '粤西农批57号仓', value: 57 }, { label: '粤西农批58号仓', value: 58 }, { label: '粤西农批59号仓', value: 59 }]
			});
		},
		onCenterSelected(e) {
			const { selected } = e.detail;
			const { centerSelected } = this.data;

			if(selected['value'] == centerSelected['value']) {
				return false;
			}

			this.setData({ centerSelected: selected });
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})