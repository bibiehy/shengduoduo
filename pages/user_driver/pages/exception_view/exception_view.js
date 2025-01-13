import useRequest from '../../../../utils/request';
import { delay, createGuid, form } from '../../../../utils/tools';
import { fetchExceptionView } from '../../../../service/user_driver';

Page({
	data: {
        kabanList: [{ checked: false, number: 1 }, { checked: false, number: 2 }, { checked: false, number: 3 }],
        // 图片
		visible: false,
		originFiles: [],
		showIndex: 0,
    },
    // 查看大图
	onViewImage(e) {
		const { qianshouList, querenList } = this.data;
		const { type, id, index } = e.currentTarget.dataset;
		const newList = type == 'qianshou' ? qianshouList : querenList;
		const thisItem = newList.find((item) => item['id'] == id);
		this.setData({ visible: true, originFiles: thisItem['img'], showIndex: index });
	},
	onClose() {
		this.setData({ visible: false });
	},
	async onLoad(options) {
		const result = await useRequest(() => fetchExceptionView({ id: options['id'] }));
		if(result) {
			
		}
	}
})