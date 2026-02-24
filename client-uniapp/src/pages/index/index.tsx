import { View, Text, Image, Input, Button, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useMemo } from 'react'
import CitySelector from '../../components/CitySelector' // 引入组件
import PriceStarFilter from '../../components/PriceStarFilter' // 引入价格星级组件
import RangeCalendar from '../../components/RangeCalendar' // 引入日历组件
import './index.scss'

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false); // 登录弹窗状态
  const [city, setCity] = useState('上海'); // 默认为上海
  const [showCitySelector, setShowCitySelector] = useState(false); // 城市选择弹窗状态
  const [showPriceFilter, setShowPriceFilter] = useState(false); // 价格星级弹窗状态
  const [priceFilter, setPriceFilter] = useState<{ minPrice: string, maxPrice: string, starRatings: string[] } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false); // 日历弹窗状态
  const [checkInDate, setCheckInDate] = useState(new Date()); // 入住日期
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d;
  }); // 离店日期
  const [keyword, setKeyword] = useState(''); // 搜索关键字
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // 已选快捷标签

  // 计算自定义导航栏高度
  const { navBarHeight, statusBarHeight, menuButtonRect } = useMemo(() => {
    const sysInfo = Taro.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;
    const menuButtonRect = Taro.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButtonRect.top - statusBarHeight) * 2 + menuButtonRect.height + statusBarHeight;
    return { navBarHeight, statusBarHeight, menuButtonRect };
  }, []);

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 计算住几晚
  const nightCount = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // 获取星期几
  const getWeekday = (date: Date) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const target = new Date(date); target.setHours(0, 0, 0, 0);
    if (target.getTime() === today.getTime()) return '今天';
    if (target.getTime() === tomorrow.getTime()) return '明天';
    return days[date.getDay()];
  }

  const handleCalendarConfirm = (start: Date, end: Date) => {
    setCheckInDate(start);
    setCheckOutDate(end);
  };

  useDidShow(() => {
    console.log('Page shown.')
    checkLoginStatus();
  })

  const [banners, setBanners] = useState<any[]>([]);

  useDidShow(() => {
    console.log('Page shown.')
    checkLoginStatus();
    fetchBanners();
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

  const fetchBanners = () => {
    Taro.request({
      url: 'http://192.168.1.76:5000/api/banners',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          setBanners(res.data.data);
        }
      },
      fail: (err) => {
        console.error('Fetch Banners Error:', err);
      }
    });
  };

  const handleBannerClick = (banner: any) => {
    if (banner.target_url) {
      // Check if target url contains hotel detail route rules, e.g /pages/hotelDetail/index?id=X
      Taro.navigateTo({ url: banner.target_url });
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

  const handleSearch = () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showToast({ title: '请先登录', icon: 'none', duration: 1500 });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 500);
      return;
    }
    // 已登录，跳转到酒店列表页
    const params = [
      `city=${encodeURIComponent(city)}`,
      `checkIn=${checkInDate.getTime()}`,
      `checkOut=${checkOutDate.getTime()}`,
      `keyword=${encodeURIComponent(keyword)}`,
      `tags=${encodeURIComponent(JSON.stringify(selectedTags))}`,
      `priceFilter=${encodeURIComponent(JSON.stringify(priceFilter))}`
    ].join('&');
    Taro.navigateTo({ url: `/pages/hotelList/index?${params}` });
  };

  // 点击快捷标签，切换选中状态
  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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
      {/* 自定义导航栏 - 透明 */}
      <View
        className='custom-nav-bar'
        style={{
          height: `${navBarHeight}px`,
          paddingTop: `${statusBarHeight}px`,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          pointerEvents: 'none'
        }}
      >
        <View
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '34rpx',
            fontWeight: 'bold',
            color: '#ffffff',
            height: `${menuButtonRect.height}px`,
            lineHeight: `${menuButtonRect.height}px`,
            marginTop: `${menuButtonRect.top - statusBarHeight}px`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          酒店预订
        </View>
      </View>

      {/* 1. Banner Section - 沉浸式图片 */}
      <View
        className='banner-section'
        style={{
          height: `calc(460rpx + ${navBarHeight}px)`,
          position: 'relative'
        }}
      >
        {banners.length > 0 ? (
          <Swiper
            className="banner-swiper"
            circular
            indicatorDots
            autoplay
            interval={4000}
            indicatorColor="rgba(255, 255, 255, 0.5)"
            indicatorActiveColor="#ffffff"
            style={{ height: '100%', width: '100%' }}
          >
            {banners.map((item) => (
              <SwiperItem key={item.id} onClick={() => handleBannerClick(item)}>
                <Image
                  className="banner-image"
                  src={item.image_url.startsWith('http') ? item.image_url : `http://192.168.1.76:5000${item.image_url}`}
                  mode="aspectFill"
                  style={{ width: '100%', height: '100%' }}
                />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View
            style={{
              paddingTop: `${navBarHeight + 40}px`,
              paddingLeft: '32rpx',
              color: 'white',
              background: 'linear-gradient(180deg, #0066f6 0%, #2b85fc 100%)',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Text style={{ fontSize: '48rpx', fontWeight: 'bold' }}>开启您的美好旅程</Text>
          </View>
        )}
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

          {activeTab === 0 ? (
            <>
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
                    value={keyword}
                    onInput={e => setKeyword(e.detail.value)}
                    alwaysEmbed
                  />
                </View>
              </View>

              {/* Date Picker */}
              <View className='date-row' onClick={() => setShowCalendar(true)}>
                <View className='date-item'>
                  <Text className='label'>入住</Text>
                  <View className='date-val'>
                    <Text>{formatDate(checkInDate)}</Text>
                    <Text className='weekday'>{getWeekday(checkInDate)}</Text>
                  </View>
                </View>

                <View className='night-count'>共{nightCount}晚</View>

                <View className='date-item' style={{ alignItems: 'flex-end' }}>
                  <Text className='label'>离店</Text>
                  <View className='date-val'>
                    <Text>{formatDate(checkOutDate)}</Text>
                    <Text className='weekday'>{getWeekday(checkOutDate)}</Text>
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
                  <View
                    key={idx}
                    className={`tag-item ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </View>
                ))}
              </View>

              {/* Search Button */}
              <Button className='search-btn' onClick={handleSearch}>
                查询
              </Button>
            </>
          ) : (
            <View className='coming-soon'>
              <Text className='coming-soon-text'>暂未开放，敬请期待</Text>
            </View>
          )}

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

      {/* Range Calendar Modal */}
      <RangeCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleCalendarConfirm}
        initialStartDate={checkInDate}
        initialEndDate={checkOutDate}
      />
    </View>
  )
}
