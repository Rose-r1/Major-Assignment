import { View, Text, Image, Input, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import CitySelector from '../../components/CitySelector' // 引入组件
import PriceStarFilter from '../../components/PriceStarFilter' // 引入价格星级组件
import './index.scss'

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false); // 登录弹窗状态
  const [city, setCity] = useState('上海'); // 默认为上海
  const [showCitySelector, setShowCitySelector] = useState(false); // 城市选择弹窗状态
  const [showPriceFilter, setShowPriceFilter] = useState(false); // 价格星级弹窗状态
  const [priceFilter, setPriceFilter] = useState<{ minPrice: string, maxPrice: string, starRatings: string[] } | null>(null);

  // 模拟日期
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  useDidShow(() => {
    console.log('Page shown.')
    checkLoginStatus();
  })

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  };

  const handleGoLogin = () => {
    console.log('跳转去登录');
    Taro.navigateTo({ url: '/pages/login/index' })
    // setShowLoginModal(false); // 不需要手动关闭，回来后如果已登录，自然不显示
  };

  const handleCitySelectorClick = () => {
    setShowCitySelector(true); // 打开弹窗
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCitySelector(false); // 关闭弹窗
  };

  const handlePriceClick = () => {
    setShowPriceFilter(true);
  };

  const handlePriceConfirm = (result) => {
    console.log('Price/Star Filter Result:', result);
    // 判断是否有实际选择内容
    const hasSelection = result.minPrice || result.maxPrice || result.starRatings.length > 0;
    setPriceFilter(hasSelection ? result : null);
  };

  // 星级值 -> 显示文字的映射
  const starLabelMap: Record<string, string> = {
    '2': '2钻/星', '3': '3钻/星', '4': '4钻/星', '5': '5钻/星',
    'gold': '金钻', 'platinum': '铂钻'
  };

  // 生成筛选结果的显示文字
  const getFilterDisplayText = () => {
    if (!priceFilter) return '';
    const parts: string[] = [];
    if (priceFilter.minPrice || priceFilter.maxPrice) {
      const min = priceFilter.minPrice || '0';
      const max = priceFilter.maxPrice ? `¥${priceFilter.maxPrice}` : '不限';
      parts.push(`¥${min}-${max}`);
    }
    if (priceFilter.starRatings.length > 0) {
      const labels = priceFilter.starRatings.map(v => starLabelMap[v] || v);
      parts.push(labels.join('|'));
    }
    return parts.join(' | ');
  };

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
            <View className='city-selector' onClick={handleCitySelectorClick}>
              <Text>{city}</Text>
              <Text className='arrow-down'>▼</Text>
            </View>
            <View className='search-input-box'>
              <Input
                className='search-input'
                placeholder='位置/品牌/酒店'
                placeholderClass='placeholder'
              />
            </View>
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
          <View className='filter-row' onClick={handlePriceClick}>
            {priceFilter ? (
              <Text className='filter-value'>{getFilterDisplayText()}</Text>
            ) : (
              <Text className='filter-label'>价格/星级</Text>
            )}
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

      {/* Login Modal */}
      {/* Login Bar (Fixed Bottom) */}
      {showLoginModal && (
        <View className='fixed-login-bar' onClick={handleGoLogin}>
          <View className='text-content'>
            <Text className='title'>登录解锁更低价</Text>
          </View>
          <View className='btn-action'>
            立即登录
          </View>
        </View>
      )}

      {/* City Selector Modal */}
      <CitySelector
        visible={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelect={handleCitySelect}
      />

      {/* Price Star Filter Modal */}
      <PriceStarFilter
        visible={showPriceFilter}
        onClose={() => setShowPriceFilter(false)}
        onConfirm={handlePriceConfirm}
      />
    </View>
  )
}
