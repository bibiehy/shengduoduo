import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
import useRequest from '../../../../utils/request';
import { fetchDriverList } from '../../../../service/drivers';
import { fetchUserDelete, fetchUserDisabled } from '../../../../service/user';
import { form, delay } from '../../../../utils/tools';

// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
        centerList: [],
		centerSelected: {},
        keyword: '',
		currentPage: 1,
		dataList: [],
        // 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
        upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
        // 确认删除弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base' },
		deleteItem: {},
	},
	methods: {
        // 列表
        async onAjaxList(thisPage, callback) { // 列表请求
            const { centerSelected, keyword, dataList, upStatus } = this.data;
            const result = await useRequest(() => fetchDriverList({ page: thisPage, center_id: centerSelected['value'], keyword }));
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
        onSearchChange(e) { // 更新搜索关键字
            const targetValue = e.detail.value;
            this.setData({ keyword: targetValue });
        },
        onSearch() { // 搜索
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
        // 操作
        async onDisabled(e) { // 禁用/启用
            const { dataList } = this.data;
            const { id, status, index } = e.currentTarget.dataset;
            const result = await useRequest(() => fetchUserDisabled({ id, status: status == 1 ? 2 : 1 }));
            if(result) {
                dataList[index]['disabled'] = status == 1 ? 2 : 1;
                this.setData({ dataList });
                wx.showToast({ title: status == 1 ? '已禁用' : '已启用', icon: 'success' });
            }
        },
        onDelete(e) {
            const { item } = e.currentTarget.dataset;
            this.setData({ showConfirm: true, deleteItem: item });
        },
        async onDeleteSure() { // 确认删除
            const { deleteItem, dataList } = this.data;
            this.setData({ showConfirm: false }); // 先关闭确认框
    
            const result = await useRequest(() => fetchUserDelete({ id: deleteItem['id'] }));
            if(result) {
                const findIndex = dataList.findIndex((item) => item['id'] == deleteItem['id']);
                dataList.splice(findIndex, 1);
                this.setData({ dataList, deleteItem: {} });
                wx.showToast({ title: '删除成功', icon: 'success' });
            }
        },
        onCancelDialog() {
            this.setData({ showConfirm: false });
        },
        addEditDriver(e) { // 添加/编辑司机
            const { centerSelected } = this.data;
            const { type, id } = e.currentTarget.dataset;
            wx.navigateTo({ 
                url: `/pages/drivers/pages/mgt_add_driver/adddriver?actionType=${type}&id=${id}&centerId=${centerSelected['value']}`,
                events: { // 注册事件监听器
                    acceptOpenedData: (result) => { // 监听由子页面触发的同名事件
                        if(type == 'create') {
                            this.onAjaxList(1);
                        }else{ // edit
                            const { dataList } = this.data;
                            const findIndex = dataList.findIndex((item) => item['id'] == result['id']);
                            if(findIndex >= 0) {
                                dataList.splice(findIndex, 1, result);
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
            const userInfo = app['userInfo']; // 返回调度管理员所分配的集货中心信息
			const centerList = userInfo['center_list'].map((item) => ({ label: item['name'], value: item['id'] }));
            const defaultCenter = JSON.parse(wx.getStorageSync('DIAODU_MAIN_CENTER') || JSON.stringify(centerList[0]));
			this.setData({ centerList, centerSelected: defaultCenter });
			this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})