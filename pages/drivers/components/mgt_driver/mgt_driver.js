
import useRequest from '../../../../utils/request';
import { fetchDriverList } from '../../../../service/drivers';
import { fetchUserDelete, fetchUserDisabled } from '../../../../service/user';
import { form, delay, getRoleInfo } from '../../../../utils/tools';

Component({
	properties: {

	},
	data: {
        tabActive: 'list', // Tabs 切换：list 司机列表，status 配送概况
        radioChecked: 'date', // 配送概况：date 日期，all 全部
        // 司机列表信息
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
        onTabs(e) { // Tabs 切换
            const { value } = e.currentTarget.dataset;
            this.setData({ tabActive: value });
        },
        onPeisongRadio(e) { // 配送概况
            const { value } = e.currentTarget.dataset;
            this.setData({ radioChecked: value });
        },
        // 列表
        async onAjaxList(thisPage, callback) { // 列表请求
            const { keyword, dataList, upStatus } = this.data;
            const result = await useRequest(() => fetchDriverList({ page: thisPage, keyword }));
            if(result) {
                //
                const newList = result['content'];

                // upStatus == 2 表示上拉加载，数据许合并
                this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList });

                if(Object.prototype.toString.call(callback) == '[object Function]') {
                    callback(newList);
                }
            }
        },	
        onRefresh(action, formValues) { // 1.create/edit 添加/编辑页面，保存后会调用该方法; 2.refresh 下拉刷新
            const type = (typeof action) == 'string' ? action : action['type'];
            if(type == 'refresh') { // 下拉刷新
                this.setData({ downStatus: true });
                this.onAjaxList(1, async () => {
                    await delay(500);
                    this.setData({ downStatus: false });
                });
            }else if(type == 'create') { // 添加
                this.onAjaxList(1);
            }else if(type == 'edit') { // 编辑
                const { dataList } = this.data;
                const findIndex = dataList.findIndex((item) => item['id'] == formValues['id']);
                if(findIndex >= 0) {
                    // formValues['address'] = JSON.parse(formValues['address']);
                    // formValues['addressStr'] = (formValues['address'].map((adItem) => adItem['label'])).join('、');
                    dataList.splice(findIndex, 1, formValues);
                    this.setData({ dataList });
                }
            }
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
            const { type, id } = e.currentTarget.dataset;
            wx.navigateTo({ 
                url: `/pages/drivers/pages/mgt_add_driver/adddriver?actionType=${type}&id=${id}`,
                events: { // 注册事件监听器
                    acceptOpenedData: (formValues) => { // 监听由子页面触发的同名事件
                        if(type == 'create') {
                            this.onAjaxList(1);
                        }else{ // edit
                            const { dataList } = this.data;
                            const findIndex = dataList.findIndex((item) => item['id'] == formValues['id']);
                            if(findIndex >= 0) {
                                // formValues['address'] = JSON.parse(formValues['address']);
                                // formValues['addressStr'] = (formValues['address'].map((adItem) => adItem['label'])).join('、');
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
			this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})