
import useRequest from '../../../../utils/request';
import { fetchGetGlobalInfo } from '../../../../service/global';

// 根据指定日期返回与当前日期的差值
function compareDate(dateStr) {
	const msgDate = new Date(dateStr);
	const currentDate = new Date();
	const diffMs = currentDate - msgDate;

	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if(diffSeconds < 60) {
		return { type: 'seconds', value: diffSeconds };
	}else if(diffMinutes < 60) {
		return { type: 'minutes', value: diffMinutes };
	}else if(diffHours < 24) {
		return { type: 'hours', value: diffHours };
	}else{
		return { type: 'days', value: diffDays };
	}
}
  
Component({
	properties: {

	},
	data: {
		opacity: 0,
		swiperNavigation: { type: 'dots-bar' }, //  navigation="{{swiperNavigation}}"
		swiperList: [], // banner
	},
	methods: {
		// 控制透明度 navigation-bar
		onScrollView(e) {
			const { scrollTop } = e.detail;
			const thisOpacity = scrollTop / 50;
			const newOpacity = thisOpacity >= 1 ? 1 : thisOpacity;
			this.setData({ opacity: newOpacity });
		},
		// 获取banner
		async getBannerList() {
			const result = await useRequest(() => fetchGetGlobalInfo());
			if(result) {
				const fileList = result['banner'];
				this.setData({ swiperList: fileList });
			}
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			// 获取banner
			this.getBannerList();
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})