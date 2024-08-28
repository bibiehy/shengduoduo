// 获取用户信息
export const fetchGetUserInfo = (params) => ({ url: '/user/getUserInfo', delay: params['delay'] });

// 获取集货中心列表
export const fetchAllStoreCenter = () => ({ url: '/common/getCollectCenters' });

// 获取提货点列表
export const fetchAllPickupPoint = () => ({ url: '/common/getPickupList' });

// 获取规格分类列表
export const fetchAllGuige = () => ({ url: '/common/getSpecCategory' });