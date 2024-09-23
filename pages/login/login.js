import useRequest from '../../utils/request';
import { fetchWxLogin, fetchPhoneLogin, fetchToken, fetchSendSMS, fetchSignConsignor, fetchSignDriver } from '../../service/login';
import { getUserAndGoRolePage, form, getScrollColor } from '../../utils/tools';

// 黑神话悟空
// 王小北
// 南来北往
// 和平广场180号
// 20000

// 获取 app 实例
const app = getApp();

Page({
	data: {
		loginVisible: false, // 是否显示验证码登录
		isChecked: false, // 协议是否选中
		roleState: '', // 1: 无角色; 2: 单角色; 3: 多角色; 4: 正在审核中; 5: 审核不通过，请完善信息后重新提交; 10: 提交成功，等待审核(非接口定义)
		phoneNumber: '', // 手机号码
		phoneNumberAsterisk: '', // 中间4位为*
		// roleList: [{ type: 1, name: '发货人' }, { type: 2, name: '收货人' }, { type: 3, name: '干线司机' }], // 角色列表，用于多角色
		roleList: [],
		roleValue: '', // 多角色，选择的角色值
		countDownTime: 0, // 倒计时时间，秒
		verifycode: '', // 短信验证码		
		// 注册
		// roleState: '1', // 测试
		// phoneNumber: '180****6071', // 测试 '18069866071'.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
		tabsValue: 'consignor',
		// 在审核拒绝时候使用
		userInfo: {}
	},
	onWxAuth() { // 判断是否勾选用户协议
		if(!this.data.isChecked) {
			wx.showToast({ title: '请勾选用户协议', icon: 'error' });
			return false;
		}
	},
	onGetToken(phone, roleType) { // 获取token
		wx.login({ // 微信登录，获取 authCode
			success: async (res) => {
				const authCode = res.code; // 根据 code 获取 openId 和 session_key，再根据 openId 和 session_key 加密返回 token
				const token = await useRequest(() => fetchToken({ code: authCode, phone, roleType })); // 返回 token
				if(token) {
					wx.setStorageSync('MINI_PROGRAM_TOKEN', token);
					getUserAndGoRolePage(app, 0); // 获取用户信息保存到全局且跳到角色对应的页面
				}
			},
			fail: () => {
				wx.showToast({ title: '授权失败，请重试' })
			}
		});
	},
	async onPhoneNumber(e) { // 微信手机号授权登录
		if(e.detail.errMsg === 'getPhoneNumber:ok') {
			const code = e.detail.code;
			const result = await useRequest(() => fetchWxLogin({ code })); // 返回角色信息
			if(result) {
				const state = result['type'] // 1: 无角色; 2: 单角色; 3: 多角色; 4: 正在审核中; 5: 审核不通过;
				const roleList = result['data'];
				if(state == 2 && roleList.length == 1) {
					this.onGetToken(result['phone'], roleList[0]['type']);
				}else{
					const phoneNumberAsterisk = String(result['phone']).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
					const userInfo = state == 5 ? result['user_info'] : {};
					const tabsValue = state == 5 ? (userInfo['role_type'] == 1 ? 'consignor' : 'drivers') : 'consignor';
					this.setData({ roleState: state, phoneNumber: result['phone'], roleList, phoneNumberAsterisk, roleValue: state == 3 ? roleList[0]['type'] : '', tabsValue, userInfo });

					// 调用子组件方法
					const child = tabsValue == 'consignor' ? this.selectComponent('#signupConsignor') : this.selectComponent('#signupDrivers');
					child.getPageRequest(userInfo);
				}
			}
		}
	},
	onShowLogin() { // 显示验证码登录
		this.setData({ loginVisible: true });
	},
	onHideLogin() { // 返回，隐藏验证码登录
		this.setData({ loginVisible: false });
	},
	onCheckbox(e) { // 隐私协议
		this.setData({ isChecked: e.detail.checked });
	},
	onRoleRadio(e) { // 选择登录角色
		this.setData({ roleValue: e.detail.value });
	},
	onRoleSure() { // 选择角色-确定
		const { phoneNumber, roleValue } = this.data;
		this.onGetToken(phoneNumber, roleValue);
	},
	// 手机验证码登录
	onPhoneChange(e) { // 手机号码事件
		const phoneNumber = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
		this.setData({ phoneNumber });
	},
	async onPhoneCode() { // 获取验证码
		const { phoneNumber, countDownTime } = this.data;
		if(countDownTime > 0) {
			return false;
		}

		if(!phoneNumber) {
			wx.showToast({ title: '请输入手机号码', icon: 'error' });
			return false;
		}

		if(phoneNumber && !/^1[0-9]{10}$/.test(phoneNumber)) {
			wx.showToast({ title: '手机格式不正确', icon: 'error' });
			return false;
		}

		const result = await useRequest(() => fetchSendSMS({ phone: phoneNumber }));
		if(result) {
			this.onCountDown();
		}
	},
	onCountDown() { // 倒计时
		let that = this;

		const countDown = (seconds) => {
			seconds = seconds - 1;
			if(seconds >= 0) {
				that.setData({ countDownTime: seconds });
				setTimeout(() => {
					countDown(seconds);
				}, 1000);
			}
		}

		countDown(60);
	},
	onCodeChange(e) { // 验证码
		const verifycode = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
		this.setData({ verifycode });
	},
	async onCodeLogin() { // 验证码登录按钮
		const { isChecked, phoneNumber, verifycode } = this.data;

		if(!phoneNumber) {
			wx.showToast({ title: '请输入手机号码', icon: 'error' });
			return false;
		}

		if(phoneNumber && !/^1[0-9]{10}$/.test(phoneNumber)) {
			wx.showToast({ title: '手机格式不正确', icon: 'error' });
			return false;
		}

		if(!verifycode) {
			wx.showToast({ title: '请输入验证码', icon: 'error' });
			return false;
		}

		if(!isChecked) {
			wx.showToast({ title: '请勾选用户协议', icon: 'error' });
			return false;
		}

		const result = await useRequest(() => fetchPhoneLogin({ phone: phoneNumber, code: verifycode })); // 返回角色信息
		if(result) {
			const state = result['type'] // 1: 无角色; 2: 单角色; 3: 多角色; 4: 正在审核中; 5: 审核不通过;
			const roleList = result['data'];
			if(state == 2 && roleList.length == 1) { // 单角色，获取token后直接跳转到首页
				this.onGetToken(result['phone'], roleList[0]['type']);
			}else{
				const phoneNumberAsterisk = String(result['phone']).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
				const userInfo = state == 5 ? result['user_info'] : {};
				const tabsValue = state == 5 ? (userInfo['role_type'] == 1 ? 'consignor' : 'drivers') : 'consignor';
				this.setData({ roleState: state, phoneNumber: result['phone'], roleList, phoneNumberAsterisk, roleValue: state == 3 ? roleList[0]['type'] : '', tabsValue, userInfo });

				// 调用子组件方法
				const child = tabsValue == 'consignor' ? this.selectComponent('#signupConsignor') : this.selectComponent('#signupDrivers');
				child.getPageRequest(userInfo);
			}
		}
	},
	onGoPrivacy() { // 用户协议
		wx.navigateTo({ url: '/pages/privacy/privacy' });
	},
	// 注册
	onClickTabs(e) { // tabs
		const { tabsValue } = this.data;
		const dataValue = e.target.dataset.value;
		if(tabsValue == dataValue) {
			return false;
		}

		this.setData({ tabsValue: dataValue });
	},
	async onSignupSure() { // 提交：注册发货人或干线司机
		const { tabsValue, userInfo } = this.data;
		const child = tabsValue == 'consignor' ? this.selectComponent('#signupConsignor') : this.selectComponent('#signupDrivers');
		const formValues = child.getFormValues();
		if(formValues) {
			if(userInfo['id']) {
				formValues['id'] = Number(userInfo['id']);
			}

			const result = tabsValue == 'consignor' ? (await useRequest(() => fetchSignConsignor(formValues))) : (await useRequest(() => fetchSignDriver(formValues)));
			if(result) {
				this.setData({ roleState: 10 }); // 等待审核
			}
		}
	},
	onLoad(options) {
		
	},
	// onPageScroll(e) { 
	// 	const navigationBackgroundColor = getScrollColor(e.scrollTop, '#1677ff');
    //     if(navigationBackgroundColor) {
    //         this.setData({ navigationBackgroundColor });
    //     }
    // }
});