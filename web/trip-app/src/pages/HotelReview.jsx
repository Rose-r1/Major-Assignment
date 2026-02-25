import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Empty,
  Select,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getHotels, forceOfflineHotel, restoreHotelToPending, auditHotel, getAuditList } from '@/api/admin';
import debounce from 'lodash.debounce';
import './HotelReview.css';

export default function HotelReview() {
  const [hotels, setHotels] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState('全部');

  const fetchHotelList = async (searchKeyword = '') => {
    try {
      const res = await getHotels({ keyword: searchKeyword });
      const list = Array.isArray(res) ? res : (res?.data || []);

      const formatted = list.map((item) => ({
        id: item.id,
        name_cn: item.name_cn,
        name_en: item.name_en,
        address: item.address,
        status: mapStatus(item.status),
        rejectionReason: '',
        isOffline: item.status === 2,
        starRating: item.star_rating,
        mainImage: item.main_image,
        opening_date: item.opening_date,
        description: item.description,
        nearby_info: item.nearby_info,
      }));

      setHotels(formatted);
    } catch (e) {
      setHotels([]);
      message.error('获取酒店列表失败');
    }
  };

  // 初次加载
  useEffect(() => {
    fetchFilteredHotels(filterType, keyword);
  }, []);

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((value) => {
      fetchFilteredHotels(filterType, value);
    }, 500),
    [filterType]
  );

  const handleChange = (value) => {
    setFilterType(value);
    fetchFilteredHotels(value, keyword);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  const fetchFilteredHotels = async (type, keyword) => {
    try {
      let list = [];
      if (type === '待审核') {
        const res = await getAuditList({ keyword });
        list = Array.isArray(res) ? res : res?.data || [];
      } else {
        const res = await getHotels({ keyword });
        list = Array.isArray(res) ? res : res?.data || [];
      }

      const formatted = list.map((item) => ({
        id: item.id,
        name_cn: item.name_cn,
        name_en: item.name_en,
        address: item.address,
        status: mapStatus(item.status),
        rejectionReason: '',
        isOffline: item.status === 2,
        starRating: item.star_rating,
        mainImage: item.main_image,
        opening_date: item.opening_date,
        description: item.description,
        nearby_info: item.nearby_info,
      }));

      setHotels(formatted);
    } catch (error) {
      console.error(error);
      message.error('获取酒店列表失败');
      setHotels([]);
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailHotel, setDetailHotel] = useState(null);
  // 查看详情
  const handleViewDetail = (hotel) => {
    setDetailHotel(hotel);
    setDetailVisible(true);
  };

  // 通过审核
  const handleApprove = async (id) => {
    await auditHotel(id, 'pass');
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id
          ? { ...hotel, status: 'approved', rejectionReason: '' }
          : hotel
      )
    );
    message.success('审核通过');
  };

  // 拒绝审核（打开模态框输入原因）
  const handleReject = (hotel) => {
    setSelectedHotel(hotel);
    //form.resetFields();
    setIsModalVisible(true);
  };

  // 确认拒绝
  const handleConfirmReject = async () => {
    try {
      //const values = await form.validateFields();
      await auditHotel(selectedHotel.id, 'reject');
      setHotels(
        hotels.map((hotel) =>
          hotel.id === selectedHotel.id
            ? {
              ...hotel,
              status: 'rejected',
              isOffline: true,
              //rejectionReason: values.reason,
            }
            : hotel
        )
      );
      setIsModalVisible(false);
      message.success('已拒绝审核');
    } catch (error) {
      message.error('拒绝失败');
      console.error(error);
    }
  };

  // 下线酒店（虚拟删除）
  const handleOffline = async (id) => {
    try {
      await forceOfflineHotel(id);
      setHotels(
        hotels.map((hotel) =>
          hotel.id === id ? { ...hotel, isOffline: true, status: 'rejected' } : hotel
        )
      );
      message.success('已下线');
    } catch (e) {
      message.error('下线失败');
    }
  };

  // 恢复酒店
  const handleRestore = async (id) => {
    try {
      await restoreHotelToPending(id);
      setHotels(
        hotels.map((hotel) =>
          hotel.id === id ? { ...hotel, isOffline: false, status: 'pending' } : hotel
        )
      );
      message.success('已恢复');
    } catch (e) {
      message.error('恢复失败');
    }
  };

  const mapStatus = (status) => {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'approved';
      case 2:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  // 状态标签
  const getStatusTag = (status, rejectionReason) => {
    const statusConfig = {
      pending: {
        color: 'processing',
        label: '审核中',
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: 'success',
        label: '已通过',
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: 'error',
        label: '不通过',
        icon: <CloseCircleOutlined />,
      },
    };

    const config = statusConfig[status];
    return (
      <div>
        <Tag color={config.color} icon={config.icon}>
          {config.label}
        </Tag>
        {status === 'rejected' && rejectionReason && (
          <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
            原因: {rejectionReason}
          </div>
        )}
      </div>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name_cn',
      key: 'name_cn',
      width: 150,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (text, record) =>
        getStatusTag(record.status, record.rejectionReason),
    },
    {
      title: '操作',
      key: 'action',
      width: 360,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetail(record)}>查看详情</Button>
          {!record.isOffline && (
            <>
              {record.status !== 'approved' && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record.id)}
                >
                  通过
                </Button>
              )}
              {record.status !== 'rejected' && (
                <Button
                  danger
                  size="small"
                  onClick={() => handleReject(record)}
                >
                  拒绝
                </Button>
              )}
              <Popconfirm
                title="下线酒店"
                description="确认要下线该酒店吗？"
                onConfirm={() => handleOffline(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button size="small">下线</Button>
              </Popconfirm>
            </>
          )}
          {record.isOffline && (
            <>
              <Tag color="red">已下线</Tag>
              <Button
                type="primary"
                size="small"
                onClick={() => handleRestore(record.id)}
              >
                恢复
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 过滤已下线的酒店
  // const displayedHotels = hotels.filter(
  //   (hotel) => !hotel.isOffline || hotel.isOffline
  // );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total) => `共 ${total} 条`,
  });

  return (
    <div className='review-container'>
      <div>
        <h1>酒店信息审核发布/下线</h1>
        <Input.Search
          placeholder="请输入关键词"
          style={{ marginBottom: '8px', width: 300 }}
          value={keyword}
          onChange={handleSearchChange}
          allowClear
        />
        <Select
          defaultValue="全部"
          style={{ width: 120, marginLeft: '8px' }}
          onChange={handleChange}
          options={[
            { value: '全部', label: '全部' },
            { value: '待审核', label: '待审核' },
          ]}
        />
        <div className="table-wrapper">
          {hotels.length > 0 ? (
            <Table
              dataSource={hotels}
              columns={columns}
              rowKey="id"
              bordered
              scroll={{ y: 'calc(100vh - 260px)' }}
              pagination={{
                ...pagination,
                onChange: (page, pageSize) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                  }));
                },
                onShowSizeChange: (current, size) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: 1,
                    pageSize: size,
                  }));
                },
              }}
            />
          ) : (
            <Empty description="暂无数据" />
          )}

          {/* 拒绝审核模态框 */}
          <Modal
            title="是否拒绝通过审核"
            open={isModalVisible}
            onOk={handleConfirmReject}
            onCancel={() => setIsModalVisible(false)}
            okText="确认"
            cancelText="取消"
            width={500}
            centered
            okButtonProps={{ danger: true }}
          >
            {/* <Form form={form} layout="vertical">
              <Form.Item
                name="reason"
                label="拒绝原因"
                rules={[
                  {
                    required: true,
                    message: '请输入拒绝原因',
                  },
                  {
                    max: 200,
                    message: '拒绝原因不超过200个字符',
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="请输入拒绝原因，例如：营业执照信息不清晰"
                  rows={4}
                />
              </Form.Item>
            </Form> */}
          </Modal>

          {/* 酒店详情弹窗 */}
          <Modal
            title={detailHotel ? (detailHotel.name || detailHotel.name_cn || detailHotel.name_en) : '酒店详情'}
            open={detailVisible}
            onCancel={() => setDetailVisible(false)}
            footer={null}
            width={600}
          >
            {detailHotel && (
              <div style={{ display: 'flex', gap: 24 }}>
                {detailHotel.mainImage && (
                  <img src={detailHotel.mainImage || detailHotel.main_image} alt="酒店图片" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div><b>酒店名称：</b>{detailHotel.name_cn}</div>
                  <div><b>酒店英文名称：</b>{detailHotel.name_en}</div>
                  <div><b>地址：</b>{detailHotel.address}</div>
                  <div><b>星级：</b>{detailHotel.starRating || detailHotel.star_rating || '-'}</div>
                  <div><b>开业时间：</b>{detailHotel.opening_date ? new Date(detailHotel.opening_date).toLocaleDateString() : '-'}</div>
                  <div><b>简介：</b>{detailHotel.description || '-'}</div>
                  <div><b>附近：</b>
                    {detailHotel.nearby_info && (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li><b>商场：</b>{detailHotel.nearby_info.mall || '-'}</li>
                        <li><b>景点：</b>{detailHotel.nearby_info.scenery || '-'}</li>
                        <li><b>交通：</b>{detailHotel.nearby_info.traffic || '-'}</li>
                      </ul>
                    )}
                  </div>
                  <div><b>标签：</b>{detailHotel.tags ? detailHotel.tags.join(', ') : '-'}</div>
                </div>
              </div>
            )}
          </Modal>
        </div>

      </div>

    </div>
  );
}