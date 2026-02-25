import request from './index';

export const getHotels = (params) => {
  return request.get('/admin/hotels', { params });
};

export const getAuditList = (params) => {
  return request.get('/admin/audit/list', { params });
}

export const forceOfflineHotel = (id) => {
  return request.patch(`/admin/hotels/${id}/offline`);
}

export const restoreHotelToPending = (id) => {
  return request.patch(`/admin/hotels/${id}/restore`);
}

export const auditHotel = (id, action) => {
  return request.patch(`/admin/audit/${id}`, { action });
}