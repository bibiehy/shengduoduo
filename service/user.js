// 列表 params = { page, size, name }
export const fetchUserList = (params) => ({ url: '/admin/user/getUserList', method: 'get', data: { size: 20, ...params } });

// 添加发货人
export const fetchAddFahuoren = (params) => ({ url: '/admin/user/consignorAdd', method: 'post', loading: true, delay: 500, data: params });

// 添加司机
export const fetchAddDriver = (params) => ({ url: '/admin/user/driverAdd', method: 'post', loading: true, delay: 500, data: params });

// 添加业务负责人/干线调度/财务管理/差异审核员
export const fetchAddYewufzren = (params) => ({ url: '/admin/user/leaderAdd', method: 'post', loading: true, delay: 500, data: params });

// 编辑发货人
export const fetchEditFahuoren = (params) => ({ url: '/admin/user/consignorEdit', method: 'post', loading: true, delay: 500, data: params });

// 编辑司机
export const fetchEditDriver = (params) => ({ url: '/admin/user/driverEdit', method: 'post', loading: true, delay: 500, data: params });

// 编辑务负责人/干线调度/财务管理/差异审核员
export const fetchEditYewufzren = (params) => ({ url: '/admin/user/leaderEdit', method: 'post', loading: true, delay: 500, data: params });

// 删除
export const fetchUserDelete = (params) => ({ url: `/admin/user/delete/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 禁用/启用
export const fetchUserDisabled = (params) => ({ url: `/admin/user/disable/${params['id']}/${params['status']}`, method: 'post', loading: true, delay: 500 });

// 查看详情
export const fetchUserDetail = (params) => ({ url: `/admin/user/getAdminUserById/${params['id']}`, method: 'get', loading: true, delay: 500 });










