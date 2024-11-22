import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchGuigeByTypeId } from '../../../../service/global';
import { fetchTaskReport } from '../../../../service/user_storecenter';

Page({
	data: {
        guigeInfo: {},
        guigeList: [], // 规格列表 { label: '', value: '' }
    },
    async getGuigeByTypeId(typeId) { // 根据规格类别ID获取其规格列表
        const result = await useRequest(() => fetchGuigeByTypeId({ id: typeId }));
        const newList = (result || []).map((item) => ({ label: item['name'], value: item['id'] }));
		this.setData({ guigeList: newList });
	},	
	onLoad({ strItem, guigeTypeId }) {
        const jsonGuige = JSON.parse(strItem);
        this.setData({ guigeInfo: jsonGuige });
        this.getGuigeByTypeId(guigeTypeId);
        
	}
})