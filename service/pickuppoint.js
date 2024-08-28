// 列表 params = { page, size, name }
export const fetchPickupList = (params) => ({ url: '/admin/pickupPoint/queryByPage', method: 'get', data: { size: 20, ...params } });

// 添加
export const fetchPickupCreate = (params) => ({ url: '/admin/pickupPoint/add', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchPickupEdit = (params) => ({ url: '/admin/pickupPoint/edit', method: 'post', loading: true, delay: 500, data: params });

// 删除
export const fetchPickupDelete = (params) => ({ url: `/admin/pickupPoint/delete/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 禁用/启用
export const fetchPickupDisabled = (params) => ({ url: `/admin/pickupPoint/disable/${params['id']}/${params['type']}`, method: 'post', loading: true, delay: 500 });

// 查看详情
export const fetchPickupDetail = (params) => ({ url: `/admin/pickupPoint/getById/${params['id']}`, method: 'get', loading: true, delay: 500 });










