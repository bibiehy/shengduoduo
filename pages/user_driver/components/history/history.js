import useRequest from '../../../../utils/request';
import { fetchDriverList } from '../../../../service/drivers';
import { form, delay } from '../../../../utils/tools';

// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
        keyword: '',
		currentPage: 1,
		dataList: [{ status: 3 }],
        // 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
        upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
        // 提货点
        pointOptions: [],
        pointSelected: {},
	},
	methods: {
        // 列表
        async onAjaxList(thisPage, callback) { // 列表请求
            const { pointSelected, keyword, dataList, upStatus } = this.data;
            const result = await useRequest(() => fetchDriverList({ page: thisPage, point_id: pointSelected['value'], keyword }));
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
        // 提货点
        async getPointByUserId() {
            // const userId = app['userInfo']['id'];
            // const result = await useRequest(() => fetchDriverList({ id: userId }));
            // if(result) { // { label: '', value: '', content: '', disabled: false }
            //     this.setData({ pointOptions: [] });
            // }
        },
		onSelectPoint(e) {
            const eventDetail = e.detail;
            const { pointSelected } = this.data;

            if(pointSelected['value'] == eventDetail['value']) {
				return false;
			}

            this.setData({ pointSelected: eventDetail });
            this.onAjaxList(1);
		},
    },
    lifetimes: {
        attached() { // 组件完全初始化完毕
            // this.onAjaxList(1);
            // this.getPointByUserId();
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})