// 新增/更新房型
export const upsertRoom = (hotelId, data) => {
  return request.post(`/merchant/hotels/${hotelId}/rooms`, data);
};
// 更新酒店
export const updateHotel = (id, data) => {
  return request.put(`/merchant/hotels/${id}`, data);
};
import request from './index';

export const getMyInfo = () => {
    return request.get('/auth/me');
}

export const fetchHotels = async () => {
    const merchant_id = await getMyInfo().then(res => res.data.id);
    return request.get(`/merchant/hotels?merchant_id=${merchant_id}`);
};

// 上传图片
export const uploadImage = (formData) => {
  return request.post('/common/upload', formData);
};

// 新增酒店
export const addHotel = (data) => {
  return request.post('/merchant/hotels', data);
};

// 删除酒店
export const deleteHotel = (id) => {
  return request.delete(`/merchant/hotels/${id}`);
};

// fetch房型
export const fetchRooms = (hotelId) => {
  return request.get(`/merchant/hotels/${hotelId}/room-types`);
}