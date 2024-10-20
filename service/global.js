// 获取用户信息
export const fetchGetUserInfo = (params) => ({ url: '/user/getUserInfo', delay: params['delay'] });

// 获取集货中心列表
export const fetchAllStoreCenter = () => ({ url: '/common/getCollectCenters' });

// 根据集货中心ID获取对应的提货点列表
export const fetchPickupFromCenter = (params) => ({ url: `/common/getPickupPointsByCId/${params['id']}`, loading: true, delay: 500 });

// 获取提货点列表
export const fetchAllPickupPoint = () => ({ url: '/common/getPickupList' });

// 获取规格分类列表
export const fetchAllGuige = () => ({ url: '/common/getSpecCategory' });

// 获取车辆类型
export const fetchAllCars = () => ({ url: '/common/getCarType' });

// 获取全局信息，banner上传和创建任务时规格内容填错，后被分拣员发现的处罚，用于规格上报相关功能
export const fetchGetGlobalInfo = () => ({ url: '/admin/system/get', loading: true, delay: 500 });

// 设置全局处罚信息，创建任务时规格内容填错，后被分拣员发现的处罚，用于规格上报相关功能
export const fetchSetGlobalChufa = (params) => ({ url: '/admin/system/edit', method: 'post', data: params, loading: true, delay: 500 });

// 设置全局BANNER信息，banner上传
export const fetchSetGlobalBanner = (params) => ({ url: '/admin/system/editBanner', method: 'post', data: params, loading: true, delay: 500 });

// 获取随机头像昵称
export const fetchRandomAvatar = () => ({ url: '/common/getRandomAvatar', method: 'get' });
