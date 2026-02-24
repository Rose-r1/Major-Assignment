import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import RangeCalendar from '../../components/RangeCalendar'
import './index.scss'

export default function HotelDetail() {
    const router = useRouter();
    const { id, checkIn: inTimeStr, checkOut: outTimeStr } = router.params;

    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const [currentCheckIn, setCurrentCheckIn] = useState(inTimeStr ? parseInt(inTimeStr) : Date.now());
    const [currentCheckOut, setCurrentCheckOut] = useState(outTimeStr ? parseInt(outTimeStr) : (Date.now() + 86400000));

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            const token = Taro.getStorageSync('token');
            if (!token) {
                Taro.showToast({ title: '请先登录', icon: 'none' });
                Taro.navigateTo({ url: '/pages/login/index' });
                return;
            }
            try {
                const res = await Taro.request({
                    url: `http://192.168.1.76:5000/api/hotels/${id}`,
                    header: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.data && res.data.code === 200) {
                    const data = res.data.data;
                    // Format data to match our UI needs
                    setHotel({
                        ...data,
                        name: data.name_cn,
                        star: data.star_rating,
                        score: data.score || 4.8,
                        scoreLabel: data.score_label || '超棒',
                        reviews: data.reviews_count || 4695,
                        tags: data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags) : ['中式风格', '舒适安逸'],
                        images: [
                            data.main_image ? (data.main_image.startsWith('/uploads') ? `http://192.168.1.76:5000${data.main_image}` : data.main_image) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
                        ],
                        // Ensure room types are sorted by price and images have full URLs
                        room_types: (data.room_types || []).map(room => {
                            let img = room.image;
                            // 如果 image 字段被存为了 JSON 字符串（比如 '["url"]'），需要解析它
                            if (img && typeof img === 'string' && img.startsWith('[')) {
                                try {
                                    const parsed = JSON.parse(img);
                                    img = Array.isArray(parsed) ? parsed[0] : parsed;
                                } catch (e) {
                                    console.error('解析房间图片失败', e);
                                }
                            }
                            // 处理相对路径
                            const finalImage = img ? (img.startsWith('/uploads') ? `http://192.168.1.76:5000${img}` : img) : null;
                            return { ...room, image: finalImage };
                        }).sort((a, b) => a.price - b.price)
                    });
                }
            } catch (e) {
                console.error('获取酒店详情失败', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleScroll = (e) => {
        const scrollTop = e.detail.scrollTop;
        if (scrollTop > 50 && !scrolled) setScrolled(true);
        else if (scrollTop <= 50 && scrolled) setScrolled(false);
    };

    const handleBack = () => Taro.navigateBack();

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    const getWeek = (ts: number) => {
        const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weeks[new Date(ts).getDay()];
    };

    const getNights = () => Math.max(1, Math.round((currentCheckOut - currentCheckIn) / 86400000));

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    const [navStyle, setNavStyle] = useState<any>({ paddingTop: '40px', minHeight: '32px' }); // Default values for H5

    useEffect(() => {
        if (process.env.TARO_ENV !== 'h5') {
            try {
                const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
                if (menuButtonInfo) {
                    setNavStyle({
                        paddingTop: `${menuButtonInfo.top}px`,
                        height: `${menuButtonInfo.height}px`
                        // Set the container height exactly equal to the capsule's height 
                        // and push it down by the capsule's top position.
                    });
                }
            } catch (error) {
                console.error('Failed to get menu button bounding rect', error);
            }
        }
    }, []);

    if (loading) return <View className='loading-page'><Text>加载中...</Text></View>;
    if (!hotel) return <View className='error-page'><Text>酒店数据加载失败</Text></View>;

    return (
        <View className='hotel-detail-page'>
            {/* 自定义导航栏 */}
            <View className={`custom-nav ${scrolled ? 'scrolled' : ''}`} style={{ ...navStyle }}>
                <Text className='back-btn' onClick={handleBack}>‹</Text>
                <Text className={`title ${scrolled ? 'show' : ''}`}>{hotel.name}</Text>
            </View>

            <ScrollView scrollY onScroll={handleScroll} style={{ height: '100vh' }}>
                {/* Banner */}
                <View className='banner-wrap'>
                    <Swiper className='banner-swiper' indicatorDots={false} autoplay circular onChange={(e) => setCurrentBannerIndex(e.detail.current)}>
                        {hotel.images.map((img, idx) => (
                            <SwiperItem key={idx}>
                                <Image src={img} mode='aspectFill' className='banner-img' />
                            </SwiperItem>
                        ))}
                    </Swiper>
                    <View className='banner-indicator'>
                        <View className={`indicator-item ${currentBannerIndex === 0 ? 'active' : ''}`}>封面</View>
                        <View className={`indicator-item ${currentBannerIndex > 0 ? 'active' : ''}`}>精选</View>
                        <View className='indicator-item'>{currentBannerIndex + 1}/{hotel.images.length} 相册 ›</View>
                    </View>
                </View>

                <View className='content-container'>
                    {/* 基础信息 */}
                    <View className='base-info-card'>
                        <View className='hotel-header'>
                            <Text className='hotel-name-large'>{hotel.name}</Text>
                            <Text className='hotel-en-name'>Singapore Marriott Tang Plaza Hotel</Text>
                            <View className='stars-row'>
                                {Array.from({ length: hotel.star || 5 }).map((_, i) => <Text key={i} className='star-icon diamond'>💎</Text>)}
                            </View>
                        </View>

                        <View className='facilities-scroll-wrap'>
                            <ScrollView scrollX className='facilities-list'>
                                <View className='facility-item'>
                                    <View className='icon-circle'>
                                        <Image className='f-icon' src='https://pages.c-ctrip.com/hotelapps/images/detail/opentime_W_1200_0.png_.webp?_fr=wc' mode='aspectFit' />
                                    </View>
                                    <Text className='label'>2021年装修</Text>
                                </View>
                                <View className='facility-item'>
                                    <View className='icon-circle'>
                                        <Image className='f-icon' src='https://pages.c-ctrip.com/wireless-app/imgs/hotel_detail/new_short_icons/116_W_1200_0.png_.webp?_fr=wc' mode='aspectFit' />
                                    </View>
                                    <Text className='label'>窗外好景</Text>
                                </View>
                                <View className='facility-item'>
                                    <View className='icon-circle'>
                                        <Image className='f-icon' src='https://pages.c-ctrip.com/wireless-app/imgs/hotel_detail/new_short_icons/new_2_W_1200_0.png_.webp?_fr=wc' mode='aspectFit' />
                                    </View>
                                    <Text className='label'>套房</Text>
                                </View>
                                <View className='facility-item'>
                                    <View className='icon-circle'>
                                        <Image className='f-icon' src='https://pages.c-ctrip.com/wireless-app/imgs/hotel_detail/new_short_icons/tagNewIcon_8_W_1200_0.png_.webp?_fr=wc' mode='aspectFit' />
                                    </View>
                                    <Text className='label'>下午茶</Text>
                                </View>
                                <View className='facility-item'>
                                    <View className='icon-circle'>
                                        <Image className='f-icon' src='https://pages.c-ctrip.com/wireless-app/imgs/hotel_detail/new_short_icons/30_W_1200_0.png_.webp?_fr=wc' mode='aspectFit' />
                                    </View>
                                    <Text className='label'>美式早餐</Text>
                                </View>
                            </ScrollView>
                            <View className='facility-more'>
                                <Text className='more-txt'>设施</Text>
                                <Text className='more-txt'>政策</Text>
                                <Text className='arrow'>›</Text>
                            </View>
                        </View>
                    </View>

                    {/* 日历筛选 */}
                    <View className='calendar-card'>
                        <View className='date-selection' onClick={() => setShowCalendar(true)}>
                            <View className='date-item'>
                                <Text className='val'>{formatDate(currentCheckIn)}</Text>
                                <Text className='week'>{getWeek(currentCheckIn)}</Text>
                            </View>
                            <View className='duration'>{getNights()}晚</View>
                            <View className='date-item'>
                                <Text className='val'>{formatDate(currentCheckOut)}</Text>
                                <Text className='week'>{getWeek(currentCheckOut)}</Text>
                            </View>
                            <Text className='arrow'>›</Text>
                        </View>

                        <View className='quick-filters'>
                            <ScrollView scrollX className='filters-scroll'>
                                <Text className='f-tag active'>全部房型</Text>
                                <Text className='f-tag'>含早餐</Text>
                                <Text className='f-tag'>大床</Text>
                                <Text className='f-tag'>双床</Text>
                                <Text className='f-tag'>立即确认</Text>
                                <Text className='f-tag'>免费取消</Text>
                            </ScrollView>
                        </View>
                    </View>

                    {/* 房型列表 */}
                    <View className='room-list-section'>
                        {hotel.room_types && hotel.room_types.map((room) => (
                            <View key={room.id} className='room-card'>
                                <View className='room-info-top'>
                                    <Image className='room-img' src={room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300'} mode='aspectFill' />
                                    <View className='room-details'>
                                        <Text className='room-name'>{room.name}</Text>
                                        <Text className='room-meta'>{room.description || '2张单人床 | 40m² | 2人入住 | 5-15层'}</Text>
                                        <Text className='expand-btn'>⌵</Text>
                                    </View>
                                </View>
                                <View className='room-sub-types'>
                                    <View className='sub-item'>
                                        <View className='sub-info'>
                                            <Text className='title'>普通预订</Text>
                                            <Text className='tags'>含早餐 | 立即确认 | 18:00前可免费取消</Text>
                                        </View>
                                        <View className='price-btn-wrap'>
                                            <View className='price'>
                                                <Text className='yen'>¥</Text>
                                                <Text className='num'>{room.price}</Text>
                                                <Text className='qi'>起</Text>
                                            </View>
                                            <View className='book-btn'>预订</View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 增加底部留白，防止被底部操作条遮挡 */}
                <View style={{ height: '240px' }} />
            </ScrollView>

            {/* 底部悬浮条 */}
            <View className='bottom-action-bar'>
                <View className='bar-left'>
                    <View className='item'><Text className='icon'>💬</Text><Text className='label'>问酒店</Text></View>
                    {/* <View className='item'><Text className='icon'>📞</Text><Text className='label'>电话</Text></View> */}
                </View>
                <View className='bar-right'>
                    <View className='price-info'>
                        <View className='val'>
                            <Text className='yen'>¥</Text>
                            <Text className='num'>{hotel.room_types?.[0]?.price || '---'}</Text>
                            <Text className='qi'>起</Text>
                        </View>
                    </View>
                    <View className='main-btn'>查看房型</View>
                </View>
            </View>

            <RangeCalendar
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onConfirm={(start, end) => {
                    setCurrentCheckIn(start.getTime());
                    setCurrentCheckOut(end.getTime());
                    setShowCalendar(false);
                }}
                initialStartDate={new Date(currentCheckIn)}
                initialEndDate={new Date(currentCheckOut)}
            />
        </View>
    )
}
