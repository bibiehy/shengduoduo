import useRequest from '../../../../utils/request';
import { delay } from '../../../../utils/tools';
import { fetchTaskList, fetchTaskCancel, fetchTaskException } from '../../../../service/user_fahuoren';

Component({
	properties: {

	},
	data: {
		keyword: '',
		tabsActive: '1', // 分类状态
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
			const { keyword, tabsActive, dataList, upStatus } = this.data;
			const result = await useRequest(() => fetchTaskList({ page: thisPage, name: keyword || '', status: tabsActive }));
			if(result) {
				const newList = [];
				result['content'].forEach((item) => {
					item['address'] = JSON.parse(item['address']);
					item['addressStr'] = (item['address'].map((adItem) => adItem['label'])).join('、');
					newList.push(item);
				});

				// upStatus == 2 表示上拉加载，数据许合并
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
		// Tabs
		onTabsChange(e) {
			const tabsActive = e.detail.value;
			this.setData({ tabsActive, currentPage: 1 });

			wx.showLoading();
			this.onAjaxList(1);
		},
		// 搜索
		onSearchChange(e) { // 更新搜索关键字
			const targetValue = e.detail.value;
			this.setData({ keyword: targetValue });
		},
		onSearch() { // 搜索
			this.onAjaxList(1);
		},
		// 按钮操作
		onCreate(e) { // 添加/编辑
			const { type, item } = e.currentTarget.dataset;
            const strItem = JSON.stringify(item || {});
			wx.navigateTo({
				url: `/pages/user_fahuoren/pages/task_create/task_create?type=${type}&strItem=${strItem}`,
				events: { // 注册事件监听器
					acceptOpenedData: (formValues) => { // 监听由子页面触发的同名事件
						if(type == 'create') { // 添加
							this.setData({ tabsActive: 1, currentPage: 1 }); // 显示全部
							this.onAjaxList(1);
						}else{ // 编辑
							const { dataList } = this.data;
							const findIndex = dataList.findIndex((listItem) => listItem['id'] == item['id']);
							if(findIndex >= 0) {
								dataList.splice(findIndex, 1, formValues);
								this.setData({ dataList });
							}
						}
					}
				}
			});
		},
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			// wx.showLoading();
			// this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})