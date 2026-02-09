import { View, Text, Image, Input, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)

  // 模拟日期
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index-page'>
      {/* 1. Banner Section */}
      <View className='banner-section'>
        {/* 这里可以使用实际的图片链接，暂时用纯色渐变代替 */}
        {/* <Image className='banner-image' src='...' mode='aspectFill' /> */}
        <View style={{ padding: '40px 24px', color: 'white' }}>
          <Text style={{ fontSize: '48px', fontWeight: 'bold' }}>开启您的<br />美好旅程</Text>
        </View>
      </View>

      {/* 2. Core Search Area */}
      <View className='search-card-container'>
        <View className='search-card'>

          {/* Tabs */}
          <View className='tabs-row'>
            {['国内', '海外', '钟点房', '民宿'].map((tab, index) => (
              <View
                key={index}
                className={`tab-item ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </View>
            ))}
          </View>

          {/* Location / Keyword */}
          <View className='location-row'>
            <View className='city-selector'>
              <Text>上海</Text>
              <Text className='arrow-down'>▼</Text>
            </View>
            <View className='search-input-box'>
              <Input
                className='search-input'
                placeholder='位置/品牌/酒店'
                placeholderClass='placeholder'
              />
            </View>
            <Text className='location-icon'>📍</Text>
          </View>

          {/* Date Picker */}
          <View className='date-row'>
            <View className='date-item'>
              <Text className='label'>入住</Text>
              <View className='date-val'>
                <Text>{formatDate(today)}</Text>
                <Text className='weekday'>今天</Text>
              </View>
            </View>

            <View className='night-count'>共1晚</View>

            <View className='date-item' style={{ alignItems: 'flex-end' }}>
              <Text className='label'>离店</Text>
              <View className='date-val'>
                <Text>{formatDate(tomorrow)}</Text>
                <Text className='weekday'>明天</Text>
              </View>
            </View>
          </View>

          {/* Price / Star Filter */}
          <View className='filter-row'>
            <Text className='filter-label'>价格/星级</Text>
            <Text style={{ marginLeft: 'auto', color: '#999' }}>ᐳ</Text>
          </View>

          {/* Quick Tags */}
          <View className='tags-row'>
            {['免费停车场', '近地铁', '行李寄存'].map((tag, idx) => (
              <View key={idx} className='tag-item'>{tag}</View>
            ))}
          </View>

          {/* Search Button */}
          <Button className='search-btn'>
            查询
          </Button>

        </View>
      </View>

      {/* 3. Recommended Hotels Section (填充底部空白) */}
      <View className='recommend-section'>
        <Text className='section-title'>热门推荐</Text>
        <View className='hotel-list'>
          {/* Mock Promos / Recommendations */}
          {[1, 2, 3].map(i => (
            <View key={i} className='hotel-card'>
              {/* 这里的 Mock 图片地址暂时留空或使用纯色块 */}
              <Image className='hotel-thumb' src='' mode='aspectFill' style={{ backgroundColor: '#e0e0e0' }} />
              <View className='hotel-info'>
                <Text className='name'>上海宝格丽酒店 {i}号店</Text>
                <View className='score-row'>
                  <Text className='score'>4.{8 + i}分</Text>
                  <Text className='comment'>“服务超棒，夜景无敌”</Text>
                </View>
                <View className='price-row'>
                  <Text className='currency'>¥</Text>
                  <Text className='price'>{4000 + i * 200}</Text>
                  <Text className='unit'>起</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

    </View>
  )
}
