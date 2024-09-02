// 微信授权登录，返回角色信息
export const fetchWxLogin = (params) => ({ url: '/grantLogin', method: 'post', data: { code: params['code'] } });

// 验证码登录，返回角色信息
export const fetchPhoneLogin = (params) => ({ url: '/login', method: 'post', loading: true, delay: 500, data: { code: params['code'], phone: params['phone'] } });

// 发送手机验证码
export const fetchSendSMS = (params) => ({ url: '/common/sendSms', method: 'post', loading: true, delay: 500, data: params });

// 角色选择，返回token
export const fetchToken = (params) => ({ url: '/selectRole', method: 'post', loading: true, delay: 500, data: { code: params['code'], phone: params['phone'], type: params['roleType'] } });

// 发货人注册
export const fetchSignConsignor = (params) => ({ url: '/common/consignorRegister', method: 'post', loading: true, delay: 500, data: params });

// 司机注册
export const fetchSignDriver = (params) => ({ url: '/common/driverRegister', method: 'post', loading: true, delay: 500, data: params });






