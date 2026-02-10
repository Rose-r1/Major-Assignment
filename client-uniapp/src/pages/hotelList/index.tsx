import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

// Mock 酒店数据
const MOCK_HOTELS = [
    {
        id: 1,
        name: '上海陆家嘴禧玥酒店',
        star: 4,
        score: 4.9,
        scoreLabel: '超棒',
        reviews: 4695,
        favorites: 63000,
        distance: '近外滩·东方明珠',
        highlight: 'BOSS:沪上知名米其林新荣记',
        tags: ['免费早餐', '免费停车', '行李寄存'],
        image: '',
        originalPrice: 0,
        price: 936,
        awardText: '上海美食酒店No.16',
        promoTag: '钻石贵宾价',
    },
    {
        id: 2,
        name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
        star: 3,
        score: 4.7,
        scoreLabel: '超棒',
        reviews: 6729,
        favorites: 45000,
        distance: '近陆家嘴地铁站·LCM置汇旭辉广场',
        highlight: '临沿江步道可欣赏陆家嘴夜景',
        tags: ['免费早餐', '免费停车', '钟点人员配', '行李寄存'],
        image: '',
        originalPrice: 297,
        price: 199,
        awardText: '',
        promoTag: '',
    },
    {
        id: 3,
        name: '全季酒店(上海外滩南京东路店)',
        star: 3,
        score: 4.8,
        scoreLabel: '超棒',
        reviews: 3210,
        favorites: 18900,
        distance: '近南京东路步行街·外滩',
        highlight: '地理位置绝佳，步行可到外滩',
        tags: ['近地铁', '免费WiFi', '行李寄存'],
        image: '',
        originalPrice: 459,
        price: 389,
        awardText: '',
        promoTag: '限时特惠',
    },
    {
        id: 4,
        name: '上海外滩W酒店',
        star: 5,
        score: 4.9,
        scoreLabel: '超棒',
        reviews: 5678,
        favorites: 92000,
        distance: '外滩核心·南京路',
        highlight: '江景房视野极佳，设计感十足',
        tags: ['江景房', '健身房', '泳池', 'SPA'],
        image: '',
        originalPrice: 2800,
        price: 2388,
        awardText: '上海奢华酒店Top5',
        promoTag: '钻石贵宾价',
    },
    {
        id: 5,
        name: '如家商旅酒店(上海人民广场店)',
        star: 2,
        score: 4.5,
        scoreLabel: '不错',
        reviews: 1890,
        favorites: 5670,
        distance: '近人民广场·南京路',
        highlight: '交通便利，性价比高',
        tags: ['近地铁', '免费WiFi'],
        image: '',
        originalPrice: 0,
        price: 168,
        awardText: '',
        promoTag: '',
    },
];

const FILTER_TAGS = ['外滩', '双床房', '含早餐', '免费兑早餐', '可订', '近地铁', '有泳池'];

export default function HotelList() {
    const router = useRouter();
    const { city = '上海', checkIn = '', checkOut = '', keyword = '' } = router.params;

    const [activeSort, setActiveSort] = useState(0);
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const formatShortDate = (dateStr: string) => {
        if (!dateStr) {
            const d = new Date();
            return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        const d = new Date(dateStr);
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getNights = () => {
        if (!checkIn || !checkOut) return 1;
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.max(1, Math.round(diff / 86400000));
    };

    const handleTagToggle = (tag: string) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleBack = () => {
        Taro.navigateBack();
    };

    const renderStars = (count: number) => {
        return Array.from({ length: count }, (_, i) => (
            <Text key={i} className='diamond'>💎</Text>
        ));
    };

    const formatFav = (n: number) => {
        if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
        return String(n);
    };

    const sortOptions = [
        { label: '欢迎度排序', hasArrow: true },
        { label: '位置距离', hasArrow: true },
        { label: '价格/星级', hasArrow: true },
        { label: '筛选', hasArrow: false },
    ];

    return (
        <View className='hotel-list-page'>

            {/* ===== 顶部信息栏 ===== */}
            <View className='top-bar'>
                <Text className='back-arrow' onClick={handleBack}>‹</Text>
                <View className='info-capsule'>
                    <Text className='cap-blue'>{decodeURIComponent(city as string)}</Text>
                    <Text className='cap-sep'>|</Text>

                    <View className='date-col'>
                        <View className='tiny-row'>
                            <Text className='label'>住</Text>
                            <Text className='val'>{formatShortDate(checkIn)}</Text>
                        </View>
                        <View className='tiny-row'>
                            <Text className='label'>离</Text>
                            <Text className='val'>{formatShortDate(checkOut)}</Text>
                        </View>
                    </View>

                    <Text className='cap-blue' style={{ margin: '0 8px' }}>{getNights()}晚</Text>
                    <Text className='cap-sep'>|</Text>
                    <Text className='cap-keyword'>{keyword ? decodeURIComponent(keyword as string) : '位置/品牌/酒店'}</Text>
                </View>
            </View>

            {/* ===== 排序筛选栏 ===== */}
            <View className='sort-bar'>
                {sortOptions.map((opt, idx) => (
                    <View
                        key={idx}
                        className={`sort-item ${activeSort === idx ? 'active' : ''}`}
                        onClick={() => setActiveSort(idx)}
                    >
                        <Text className='sort-text'>{opt.label}</Text>
                        {opt.hasArrow && <Text className='sort-arrow'>▼</Text>}
                    </View>
                ))}
            </View>

            {/* ===== 快捷标签 ===== */}
            <ScrollView scrollX className='tags-scroll'>
                <View className='tags-inner'>
                    {FILTER_TAGS.map((tag, idx) => (
                        <Text
                            key={idx}
                            className={`ftag ${activeTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleTagToggle(tag)}
                        >
                            {tag}
                        </Text>
                    ))}
                </View>
            </ScrollView>

            {/* ===== 酒店列表 ===== */}
            <ScrollView scrollY className='list-scroll'>
                {MOCK_HOTELS.map((hotel) => (
                    <View key={hotel.id} className='hotel-card'>
                        {/* 图片区 */}
                        <View className='card-img-wrap'>
                            <Image
                                className='card-img'
                                src={hotel.image || ''}
                                mode='aspectFill'
                                style={{ backgroundColor: '#6b8cce' }}
                            />
                            {hotel.promoTag ? (
                                <View className='img-badge'>
                                    <Text className='img-badge-text'>{hotel.promoTag}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* 信息区 */}
                        <View className='card-body'>
                            {/* 酒店名 + 星级 */}
                            <View className='name-row'>
                                <Text className='hotel-name'>{hotel.name}</Text>
                                <View className='stars-wrap'>{renderStars(hotel.star)}</View>
                            </View>

                            {/* 评分行 */}
                            <View className='score-row'>
                                <View className='score-box'>
                                    <Text className='score-val'>{hotel.score}</Text>
                                </View>
                                <Text className='score-lbl'>{hotel.scoreLabel}</Text>
                                <Text className='meta'>{hotel.reviews}点评 · {formatFav(hotel.favorites)}收藏</Text>
                            </View>

                            {/* 距离 */}
                            <Text className='dist'>{hotel.distance}</Text>

                            {/* 亮点 */}
                            <Text className='hl'>{hotel.highlight}</Text>

                            {/* 标签 */}
                            <View className='tag-row'>
                                {hotel.tags.slice(0, 4).map((t, i) => (
                                    <Text key={i} className='htag'>{t}</Text>
                                ))}
                            </View>

                            {/* 奖项 */}
                            {hotel.awardText ? (
                                <View className='award-row'>
                                    <Text className='award-icon'>🏆</Text>
                                    <Text className='award-text'>{hotel.awardText}</Text>
                                </View>
                            ) : null}

                            {/* 价格 */}
                            <View className='price-row'>
                                {hotel.originalPrice > hotel.price && (
                                    <Text className='old-price'>¥{hotel.originalPrice}</Text>
                                )}
                                <Text className='cur-price'>
                                    <Text className='yen'>¥</Text>
                                    <Text className='price-big'>{hotel.price}</Text>
                                    <Text className='qi'>起</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                <View className='list-end'>
                    <Text className='end-text'>— 已展示全部酒店 —</Text>
                </View>
            </ScrollView>
        </View>
    )
}
