import React from 'react';
import { Form, Input, InputNumber, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function AddRoom({ field, remove, uploadImage }) {
  return (
    <div key={field.key} style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 12 }}>
      <Form.Item
        name={[field.name, 'name']}
        fieldKey={[field.fieldKey, 'name']}
        rules={[{ required: true, message: '请输入房型名称' }]}
        label="房型名称"
        style={{ marginBottom: 12 }}
      >
        <Input placeholder="房型名称" />
      </Form.Item>

      <Form.Item
        name={[field.name, 'price']}
        fieldKey={[field.fieldKey, 'price']}
        rules={[{ required: true, message: '请输入价格' }]}
        label="价格"
        style={{ marginBottom: 12 }}
      >
        <InputNumber min={0} placeholder="价格" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name={[field.name, 'base_price']}
        fieldKey={[field.fieldKey, 'base_price']}
        rules={[{ required: true, message: '请输入基础价格' }]}
        label="基础价格"
        style={{ marginBottom: 12 }}
      >
        <InputNumber min={0} placeholder="基础价格" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name={[field.name, 'capacity']}
        fieldKey={[field.fieldKey, 'capacity']}
        rules={[{ required: true, message: '请输入房间容量' }]}
        label="房间容量"
        style={{ marginBottom: 12 }}
      >
        <InputNumber min={1} placeholder="房间容量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name={[field.name, 'total_rooms']}
        fieldKey={[field.fieldKey, 'total_rooms']}
        rules={[{ required: true, message: '请输入房间数量' }]}
        label="房间数量"
        style={{ marginBottom: 12 }}
      >
        <InputNumber min={1} placeholder="房间数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name={[field.name, 'image']}
        fieldKey={[field.fieldKey, 'image']}
        valuePropName="fileList"
        getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
        label="图片"
        style={{ marginBottom: 12 }}
      >
        <Upload
          listType="picture-card"
          maxCount={1}
          customRequest={uploadImage}
        >
          <PlusOutlined />
        </Upload>
      </Form.Item>

      <Button danger onClick={remove}>删除</Button>
    </div>
  );
}