
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
		
	},
	methods: {
		onPageJump(e) {
			const { name } = e.currentTarget.dataset;
			if(name == 'user') { // 用户管理
				wx.navigateTo({ url: '/pages/user/user' });
			}else if(name == 'guige') { // 规格管理
				wx.navigateTo({ url: '/pages/guige/guige' });
			}else if(name == 'store_center') { // 集货中心
				wx.navigateTo({ url: '/pages/storecenter/storecenter' });
			}else if(name == 'pickup_point') { // 提货点
				wx.navigateTo({ url: '/pages/pickuppoint/pickuppoint' });
			}else if(name == 'audit_user') { // 人员审核
				wx.navigateTo({ url: '/pages/audit/audit' });
			}else if(name == 'audit_task') { // 任务审核
				wx.navigateTo({ url: '/pages/auditask/auditask' });
			}else if(name == 'banner') { // 全局信息设置-BANNER
				wx.navigateTo({ url: '/pages/globalbanner/globalbanner' });
			}else if(name == 'chufa') { // 全局信息设置-订单处罚
				wx.navigateTo({ url: '/pages/globalchufa/globalchufa' });
			}
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