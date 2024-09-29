
/*************************** 司机列表 *************************/

// 列表 params = { page, size, type 角色类型, keyword }
export const fetchDriverList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { type: 3, size: 20, ...params } });

