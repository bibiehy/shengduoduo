// pages/administrator/pages/edit/edit.js
Page({
	data: {

	},
    onLoad(options) {
        // 获取事件监听对象
        const eventChannel = this.getOpenerEventChannel();
        setTimeout(() => {
            eventChannel.emit('acceptOpenedData', { a: 'test111', b: 2 });
        }, 2000);
	}	
})