import useRequest from './request';
import { fetchGetUserInfo } from '../service/global';

// 获取用户信息并跳转到对应的角色页面，只在 App.js 中和 login.js 中调用
export const getUserAndGoRolePage = async (app, delay) => {
	const result = await useRequest(() => fetchGetUserInfo({ delay })); // 请求用户信息
	const roleType = result['role_type']; // 获取角色类型
	app.userInfo = result; // 把用户信息保存到全局
	
	if(roleType == 1) { // 发货人
		wx.reLaunch({ url: '/pages/user_fahuoren/index' });
	}else if(roleType == 2) { // 收货人
		wx.reLaunch({ url: '/pages/user_shouhuoren/index' });
	}else if(roleType == 3) { // 干线司机
		wx.reLaunch({ url: '/pages/user_driver/index' });
	}else if([5, 6, 7].includes(roleType)) { // 5: 集货中心负责人; 6: 集货中心主管; 7: 分拣员;
		wx.reLaunch({ url: '/pages/user_storecenter/index' });
	}else if(roleType == 8) { // 干线调度
		wx.reLaunch({ url: '/pages/drivers/drivers' });
	}else if(roleType == 12) { // 超级管理员
		wx.reLaunch({ url: '/pages/administrator/administrator' });
	}
}

// 表单验证，或获取表单的值
export const form = {
    defaultNames: ['FORM_INPUT', 'FORM_AVATAR', 'FORM_RADIO', 'FORM_PICKER', 'FORM_DATEPICKER', 'FORM_RANGEPICKER', 'FORM_PROVINCECITY', 'FORM_ACTIONSHEET', 'FORM_SELECT', 'FORM_MULSELECT', 'FORM_TEXTAREA', 'FORM_UPLOAD', 'FORM_CARNUMBER'], // 所有类型的表单组件的 class
    validateFields: (that, nameList) => { // 验证所有的子组件，或只验证 nameList 组件，nameList = ['不带#的id']
        const classNames = nameList || form.defaultNames;
        const formValues = {}; // 子组件验证成功的 key/value
        const formFailed = {}; // 子组件验证失败的 key/value
        classNames.forEach((element) => {
			if(nameList) { // 则为 id 组件
				const child = that.selectComponent('#' + element);
				if(child) {
					const { verify, name, value } = child.getFieldVerify();
					if(verify) {
						formValues[name] = value;
					}else{
						formFailed[name] = value;
					}
				}
			}else{ // defaultNames
				const allChilds = that.selectAllComponents('.' + element);
				if(allChilds.length > 0) {
					allChilds.forEach((child) => {
						const { verify, name, value } = child.getFieldVerify();
						if(verify) {
							formValues[name] = value;
						}else{
							formFailed[name] = value;
						}
					});
				}
			}
        });

        return Object.keys(formFailed).length > 0 ? false : formValues;
    },
    getFieldValue: (that, id) => { // 获取指定 id 组件的值
        const child = that.selectComponent('#' + id);
        const { name, value } = child.getFieldValue();
        
        return value;
    },
    getFieldsValue: (that, nameList) => { // 获取所有子组件的值，或只获取 nameList 组件的值
        const classNames = nameList || form.defaultNames;
        const formValues = {}; // 子组件验证成功的 key/value
        classNames.forEach((element) => {
			if(nameList) { // 则为 id 组件
				const child = that.selectComponent('#' + element);
				if(child) {
					const { name, value } = child.getFieldValue();
					formValues[name] = value;
				}
			}else{ // defaultNames
				const allChilds = that.selectAllComponents('.' + element);
				if(allChilds.length > 0) {
					allChilds.forEach((child) => {
						const { name, value } = child.getFieldValue();
						formValues[name] = value;
					});                
				}
			}
        });

        return formValues;
    },
    setFieldValue: (that, id, value) => { // 设置 id 组件的值
        const child = that.selectComponent('#' + id);
        child.setFieldValue(value);
    },
    setFieldsValue: (that, fieldList) => { // 设置一组子组件的值 fieldList = { id, value }
        fieldList.forEach(({ id, value }) => {
            const child = that.selectComponent('#' + id);
            child.setFieldValue(value);
        });
    }
};

// 获取当前日期 YYYY-MM-DD HH:mm:ss，或格式化 strDate
export const getCurrentDateTime = (format, strDate) => {
    const now = strDate ? (new Date(strDate)) : (new Date());
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，要加1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let dateTime = '';
    if(format == 'YYYY') {
        dateTime = year;
    }else if(format == 'YYYY-MM') {
        dateTime = `${year}-${month}`;
    }else if(format == 'YYYY-MM-DD') {
        dateTime = `${year}-${month}-${day}`;
    }else if(format == 'YYYY-MM-DD HH') {
        dateTime = `${year}-${month}-${day} ${hours}`;
    }else if(format == 'YYYY-MM-DD HH:mm') {
        dateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    }else{
        dateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;;
    }

    return dateTime;
}

// 千分位：0、正数、负数; dotNum: 指定保留几位小数
export const fmtThousands = (value, dotNum) => {
    if(/^-?\d+(\.\d+)?$/.test(value)) { // 0、正数、负数
        let str = '';
        if(dotNum) { // 指定保留几位小数
            str = Number(value).toFixed(dotNum);
        }else{ // 如果是浮点数默认保留 2 位小数
            str = /\./.test(value) ? Number(value).toFixed(2) : (value).toString();
        }

        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return value;
};

// 生成GUID码：是二进制长度为128位的数字标识符
export const createGuid = (number) => {
    let guid = '', i = number || 32;
    for(;i--;) {
        guid += Math.floor(Math.random() * 0x10).toString(16);
        if((i == 24) || (i == 20) || (i == 16) || (i == 12)){
            guid += '-';
        }
    }
    return guid;
}

// 延时
export const delay = timeout => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};

// 用于滚动时设置顶部导航背景色
export const getScrollColor = (scrollTop, color) => {
    if(scrollTop > 240) {
        return false;
    }

    const sanitizedHex = color.replace('#', '');
    const r = parseInt(sanitizedHex.substring(0, 2), 16); // 红
    const g = parseInt(sanitizedHex.substring(2, 4), 16); // 绿
    const b = parseInt(sanitizedHex.substring(4, 6), 16); // 蓝
    const a = scrollTop / 120;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// 返回上一页面并调用父页面的 onRefresh 方法，废弃，有兼容性问题
export const goBackAndRefresh = (type, formValues) => { // create/edit，表单的值在 edit 时使用
	wx.navigateBack({ delta: 1, complete: function() {
		const pages = getCurrentPages();
		const prevPage = pages[pages.length - 1];
		prevPage.onRefresh(type, formValues);
	}});
}

// 返回角色类型
export const getRoleInfo = () => {
	// 角色类型，手机号+角色类型唯一
	const roleAllList = [
		{ label: '发货人', value: 1 }, // 可注册
		{ label: '收货人', value: 2 }, // 只能由发货人添加
		{ label: '干线司机', value: 3 }, // 可注册
		{ label: '提货点负责人', value: 4 },
		{ label: '集货中心负责人', value: 5 },
		{ label: '集货中心主管', value: 6 },
		{ label: '分拣员', value: 7 }, // 由集货中心负责人或主管添加
		{ label: '干线调度', value: 8 }, // 8/9/10/11 页面信息一样
		{ label: '业务负责人', value: 9 },
		{ label: '财务管理', value: 10 },
		{ label: '差异审核员', value: 11 },
		{ label: '超级管理员', value: 12 }
	];

	// 角色类型对象
	const roleAllObject = {};
	roleAllList.forEach((item) => roleAllObject[item['value']] = item['label']);

	return { roleAllList, roleAllObject };
}
