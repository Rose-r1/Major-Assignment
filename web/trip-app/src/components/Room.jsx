import { useEffect, useState } from 'react';
import { Table, Empty, Image, message } from 'antd';
import { fetchRooms } from '@/api/merchant';

export default function Room({ hotelId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRooms = async () => {
    if (!hotelId) return;

    try {
      setLoading(true);
      const res = await fetchRooms(hotelId);
      const list = Array.isArray(res?.data) ? res.data : [];
      setRooms(list);
    } catch (e) {
      console.error(e);
      message.error('获取房型失败');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [hotelId]);

  const columns = [
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
    },
    {
      title: '基础价格',
      dataIndex: 'base_price',
      key: 'base_price',
      width: 120,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 80,
    },
    {
      title: '房间数',
      dataIndex: 'total_rooms',
      key: 'total_rooms',
      width: 100,
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (img) =>
        img ? (
          <Image
            src={img}
            width={60}
            height={45}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          '-'
        ),
    },
  ];

  if (!rooms.length && !loading) {
    return <Empty description="暂无房型" />;
  }

  return (
    <Table
      dataSource={rooms}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
      bordered
    />
  );
}