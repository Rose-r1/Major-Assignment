import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Empty, Space, Rate, DatePicker, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchHotels, uploadImage, addHotel, deleteHotel, updateHotel, upsertRoom, fetchRooms } from '../api/merchant';
import AddRoom from '../components/addRoom';
import './HotelInfo.css';

export default function HotelInfo() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    async function loadHotels() {
      try {
        const res = await fetchHotels();
        const list = Array.isArray(res) ? res : (res?.data || []);
        // 格式化为表格需要的字段
        const formatted = list.map(item => ({
          id: item.id,
          name_cn: item.name_cn,
          name_en: item.name_en,
          address: item.address,
          starRating: item.star_rating,
          mainImage: item.main_image,
          description: item.description,
          status: item.status,
          opening_date: item.opening_date,
          nearby_info: item.nearby_info,
        }));
        setHotels(formatted);
      } catch (e) {
        setHotels([]);
      }
    }
    loadHotels();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form] = Form.useForm();

  const openAdd = () => {
    setEditingHotel(null);
    form.resetFields();
    form.setFieldsValue({ status: 0 }); // 新增时默认待审核
    setIsModalVisible(true);
  };

  const openEdit = async (record) => {
    setEditingHotel(record);

    // 先填充酒店基础信息
    form.setFieldsValue({
      name_cn: record.name_cn,
      name_en: record.name_en,
      address: record.address,
      starRating: record.starRating,
      mainImage: record.mainImage
        ? [{
          uid: '-1',
          name: '主图',
          status: 'done',
          url: record.mainImage,
        }]
        : [],
      description: record.description,
      status: record.status,
      opening_date: record.opening_date ? dayjs(record.opening_date) : null,
      nearby_info: record.nearby_info || {},
      rooms: [], // 先置空
    });

    setIsModalVisible(true);

    try {
      // 调用后端接口获取房型
      const roomRes = await fetchRooms(record.id);
      const roomsList = Array.isArray(roomRes?.data) ? roomRes.data : [];

      // 格式化房型为 Form.List 可识别结构
      const formattedRooms = roomsList.map(r => ({
        name: r.name,
        price: parseFloat(r.price),
        base_price: parseFloat(r.base_price),
        capacity: r.capacity,
        total_rooms: r.total_rooms,
        image: r.image
          ? [{
            uid: r.id,
            name: r.name,
            status: 'done',
            url: r.image,
          }]
          : [],
      }));

      // 设置到表单
      form.setFieldsValue({ rooms: formattedRooms });
    } catch (err) {
      console.error('获取房型失败', err);
      message.error('获取房型失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteHotel(id);
      if (res?.success || res?.code === 200) {
        message.success('已刪除');
        // 重新拉取列表
        const hotelRes = await fetchHotels();
        const list = Array.isArray(hotelRes) ? hotelRes : (hotelRes?.data || []);
        const formatted = list.map(item => ({
          id: item.id,
          name_cn: item.name_cn,
          name_en: item.name_en,
          address: item.address,
          starRating: item.star_rating,
          mainImage: item.main_image,
          description: item.description,
          status: item.status,
          opening_date: item.opening_date,
          nearby_info: item.nearby_info,
        }));
        setHotels(formatted);
      } else {
        message.error(res?.msg || '刪除失敗');
      }
    } catch (e) {
      message.error('刪除失敗');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单值：', values);
      // 取酒店主图
      const main_image = values.mainImage?.[0]?.response?.url || values.mainImage?.[0]?.url || '';

      const payload = {
        name_cn: values.name_cn,
        name_en: values.name_en,
        address: values.address,
        star_rating: values.starRating,
        main_image,
        description: values.description,
        status: values.status,
        opening_date: values.opening_date ? values.opening_date.format('YYYY-MM-DD') : '',
        nearby_info: values.nearby_info || {},
        merchant_id: 5,
      };

      let hotelId;
      if (editingHotel) {
        const res = await updateHotel(editingHotel.id, payload);
        if (!res?.success && res?.code !== 200) throw new Error('更新酒店失败');
        hotelId = editingHotel.id;
        message.success('酒店已更新');
      } else {
        const res = await addHotel(payload);
        if (!res?.success && res?.code !== 200) throw new Error('新增酒店失败');
        hotelId = res.data?.id; // 后端返回新增酒店 id
        message.success('酒店已新增');
      }

      // ---- 批量新增/更新房型 ----
      const rooms = values.rooms || [];
      await Promise.all(
        rooms.map(room => {
          console.log('处理房型：', room);
          const roomPayload = {
            name: room.name,
            price: parseFloat(room.price),
            base_price: parseFloat(room.base_price),
            capacity: room.capacity,
            total_rooms: room.total_rooms,
            image: room.image?.[0]?.response?.url || room.image?.[0]?.url || '',
          };
          console.log('房型 payload：', roomPayload);
          return upsertRoom(hotelId, roomPayload);
        })
      );

      // 刷新酒店列表
      const hotelRes = await fetchHotels();
      const list = Array.isArray(hotelRes) ? hotelRes : (hotelRes?.data || []);
      const formatted = list.map(item => ({
        id: item.id,
        name_cn: item.name_cn,
        name_en: item.name_en,
        address: item.address,
        starRating: item.star_rating,
        mainImage: item.main_image,
        description: item.description,
        status: item.status,
        opening_date: item.opening_date,
        nearby_info: item.nearby_info || {},
      }));
      setHotels(formatted);
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error(err.message || '保存失败');
    }
  };

  const columns = [
    { title: '酒店名称', dataIndex: 'name_cn', key: 'name_cn', width: 200 },
    { title: '英文名称', dataIndex: 'name_en', key: 'name_en', width: 200 },
    { title: '地址', dataIndex: 'address', key: 'address', width: 300 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="hotelinfo-container">
      <div className="header-row">
        <h1>酒店信息管理</h1>
        <div className="header-actions">
          <Button color="cyan" variant="solid" onClick={openAdd} className="add-btn">
            新增
          </Button>
        </div>
      </div>

      <div className="table-wrapper">
        {hotels.length > 0 ? (
          <Table
            dataSource={hotels}
            columns={columns}
            rowKey="id"
            bordered
            scroll={{ y: 'calc(100vh - 300px)' }}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>

      <Modal
        title={editingHotel ? '编辑酒店' : '新增酒店'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
        style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 16 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name_cn" label="中文名称" rules={[{ required: true, message: '请输入中文名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name_en" label="英文名称" rules={[{ required: true, message: '请输入英文名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="starRating" label="星级" rules={[{ required: true, message: '请选择星级' }]}>
            <Rate count={5} allowClear={false} />
          </Form.Item>
          <Form.Item
            name="mainImage"
            label="主图"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              e?.fileList?.map(file => ({
                ...file,
                url: file.url || file.response?.data?.url, // 确保 url 存在
              }))
            }
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append('image', file);

                  const res = await uploadImage(formData);

                  // 关键：把服务器返回的 url 塞回去
                  onSuccess(res, file);
                } catch (e) {
                  console.error(e);
                  message.error('上传失败');
                  onError(e);
                }
              }}
              onChange={({ fileList }) => {
                // 把 url 写入表单
                form.setFieldsValue({
                  mainImage: fileList,
                });
              }}
              onPreview={async file => {
                let src = file.url || file.thumbUrl;
                if (!src && file.originFileObj) {
                  src = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(file.originFileObj);
                  });
                }
                const imgWindow = window.open(src);
                if (imgWindow) {
                  imgWindow.document.write(
                    `<img src='${src}' style='max-width:100vw;max-height:100vh'/>`
                  );
                }
              }}
            >
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </Upload>
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            {(() => {
              const status = form.getFieldValue('status');
              let color = '', text = '';
              if (status === 0) { color = 'rgba(24,144,255,0.15)'; text = '待审核'; }
              else if (status === 1) { color = 'rgba(82,196,26,0.15)'; text = '已发布'; }
              else if (status === 2) { color = 'rgba(255,77,79,0.15)'; text = '已下线/审核驳回'; }
              return <div style={{ background: color, color: color === 'rgba(255,77,79,0.15)' ? '#ff4d4f' : color === 'rgba(24,144,255,0.15)' ? '#1890ff' : '#52c41a', borderRadius: 4, padding: '4px 12px', fontWeight: 500, display: 'inline-block' }}>{text}</div>;
            })()}
          </Form.Item>
          <Form.Item name="opening_date" label="开业时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="附近信息">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 48, textAlign: 'right' }}>商场：</span>
                <Form.Item name={["nearby_info", "mall"]} noStyle>
                  <Input style={{ flex: 1 }} placeholder="商场" />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 48, textAlign: 'right' }}>地铁：</span>
                <Form.Item name={["nearby_info", "subway"]} noStyle>
                  <Input style={{ flex: 1 }} placeholder="地铁" />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 48, textAlign: 'right' }}>机场：</span>
                <Form.Item name={["nearby_info", "airport"]} noStyle>
                  <Input style={{ flex: 1 }} placeholder="机场" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>
          {/* 房型管理 */}
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>房型管理</span>
                  <Button type="dashed" style={{ marginLeft: 16 }} onClick={() => add()} icon={<PlusOutlined />}>新增房型</Button>
                </div>
                {fields.map(field => (
                  <AddRoom
                    key={field.key}
                    field={field}
                    remove={() => remove(field.name)}
                    uploadImage={async ({ file, onSuccess, onError }) => {
                      try {
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await uploadImage(formData);
                        onSuccess(res, file);
                      } catch (e) {
                        onError(e);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}