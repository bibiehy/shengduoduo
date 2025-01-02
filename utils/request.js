import { delay } from './tools';

// 若域名需要修改，app.js 中文件上传域名也要修改
const domain = 'https://sddwl.tonglujipei.com/api';

const useRequest = async (service) => {
    // 参数
    let options = { url: '', method: 'GET', skipError: false, requestType: 'json', data: {}, loading: false, loadingText: '', delay: 0, headers: {} };
    
    if(typeof service === 'string') {
        options['url'] = service;
    }else if(typeof service === 'function') {
        const params = service();
        options = { ...options, ...params };
    }else if(typeof service === 'object') {
        options = { ...options, ...service };
    }
    
    // headers
    // form 会将数据转换成 query string
	// json 会对数据进行 JSON 序列化
	const MINI_TOKEN = wx.getStorageSync('MINI_PROGRAM_TOKEN');
    const headers = {
        'Authorization': MINI_TOKEN ? `Bearer ${MINI_TOKEN}` : '',
        'Content-Type': options['requestType'] == 'form' ? 'application/x-www-form-urlencoded;charset=utf-8' : 'application/json;charset=utf-8',
        ...options['headers']
    };

    // 请求时是否显示 wx.showLoading({ title: 'loading...' });
    if(options['loading']) {
        wx.showLoading({ title: options['loadingText'] });
	}
	
	// 延迟请求，默认不延迟
	if(options['delay']) {
		await delay(options['delay']);
	}

    return new Promise((reslove, reject) => {
        wx.request({
            url: `${domain}${options['url']}`,
            method: options['method'],
            data: options['data'],
            header: headers,
            complete: function (response) {
				// 取消loding
				if(options['loading']) {
					wx.hideLoading();
				}

                const status = response['statusCode'];
                if(status >= 200 && status < 300) {
					// 后端返回的数据
					const data = response['data'];
					
					// 自行处理错误
					if(options['skipError']) {
						reslove(data);
						return false;
					}
					
                    if(data['code'] == 0) {
                        reslove(data['data'] || true);
					}else if(data['code'] == 400) { // token 过期或无效，跳转登录页
						wx.reLaunch({ url: '/pages/login/login' });
                    }else if(data['code'] == 403) { // 没有访问权限
                        wx.reLaunch({ url: '/pages/page403/page403' });
					}else{ // 系统错误
						reslove('');
                        wx.showToast({ title: data['message'], duration: 2500, icon: 'none' });
                    }
                }else{
                    let errorContent = '';
                    if(status == 400) {
                        errorContent = '请求参数有误';
                    }else if(status == 401 || status == 403) {
                        errorContent = '身份验证失败';
                    }else if(status == 404) {
                        errorContent = '请求资源不存在';
                    }else{
                        errorContent = '服务器内部错误';
                    }

					reslove('');
					wx.showToast({ title: errorContent, icon: 'error', duration: 2500 });
                }
            }
        });
    });
}

export default useRequest;