
/*************************** 司机列表 *************************/

// 列表 params = { page, size, keyword }
export const fetchDriverList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

