/*************************** 主页 *************************/
// 列表 params = { page, size, name }
export const fetchMainList = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: { size: 20, ...params } });

/*************************** 司机调度 *************************/
// 调度列表
export const fetchDiaoduList = (params) => ({ url: '/dispatcher/getList', method: 'get', loading: true, delay: 500, data: { size: 20, ...params } });

// 获取集货中心下的司机
export const fetchCenterDrivers = (params) => ({ url: `/dispatcher/getCanUseDriverList/${params['centerId']}/${params['pointId']}`, method: 'get' });

// 获取可调度的卡板列表
export const fetchDiaoduKaban = (params) => ({ url: `/dispatcher/getCanCardList/${params['centerId']}/${params['pointId']}`, method: 'get' });

// 创建调度
export const fetchDiaoduCreate = (params) => ({ url: '/dispatcher/create', method: 'post', loading: true, delay: 500, data: params });

// 修改调度
export const fetchDiaoduEdit = (params) => ({ url: '/dispatcher/update', method: 'post', loading: true, delay: 500, data: params });

// 删除调度
export const fetchDiaoduDelete = (params) => ({ url: `/dispatcher/delete/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 通知调度
export const fetchDiaoduNotice = (params) => ({ url: `/dispatcher/notice/${params['id']}`, method: 'post', loading: true, delay: 500 });


/*************************** 司机管理 *************************/

// 司机列表 params = { page, size, keyword }
export const fetchDriverList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

// 配送概况 params = { page, size, keyword }
export const fetchDiverGaikuang = (params) => ({ url: '/dispatcher/getDriverSummary', method: 'get', data: { size: 20, ...params } });
