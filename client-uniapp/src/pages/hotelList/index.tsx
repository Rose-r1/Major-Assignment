import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import CitySelector from '../../components/CitySelector'
import RangeCalendar from '../../components/RangeCalendar'
import './index.scss'

const FILTER_TAGS = ['外滩', '双床房', '含早餐', '免费兑早餐', '可订', '近地铁', '有泳池'];

const PRICE_TAGS = [
    { label: '¥150以下', min: '0', max: '150' },
    { label: '¥150-¥300', min: '150', max: '300' },
    { label: '¥300-¥450', min: '300', max: '450' },
    { label: '¥450-¥600', min: '450', max: '600' },
    { label: '¥600-¥1000', min: '600', max: '1000' },
    { label: '¥1000以上', min: '1000', max: '' }
];

const STAR_OPTIONS = [
    { label: '2钻/星', value: '2' },
    { label: '3钻/星', value: '3' },
    { label: '4钻/星', value: '4' },
    { label: '5钻/星', value: '5' },
    { label: '金钻', value: 'gold' },
    { label: '铂钻', value: 'platinum' }
];

const FILTER_CATEGORIES = [
    { id: 'hot', name: '热门筛选', items: ['上榜酒店', '双床房', '家庭房', '全季', '酒店', '亚朵', '4.7分以上', '民宿', '低碳酒店'] },
    { id: 'type', name: '住宿类型', items: ['酒店', '民宿', '酒店公寓', '青年旅馆', '公寓', '钟点房'] },
    { id: 'feature', name: '酒店特色', items: ['近地铁', '亲子酒店', '电竞酒店', '四合院', '窗外好景', '拍照出片'] },
    { id: 'room', name: '客房特色', items: ['家庭房', '套房', '复式loft房', '亲子主题房', '影音房', '整栋'] },
    { id: 'facility', name: '设施', items: ['停车场', '健身房', '游泳池', '洗衣房', '会议室', '餐厅'] },
    { id: 'brand', name: '品牌', items: ['华住', '锦江', '首旅如家', '亚朵', '万豪', '希尔顿'] }
];

const SORT_DROPDOWN_OPTIONS = [
    { label: '评分从高到低', value: 'score_desc' },
    { label: '评分从低到高', value: 'score_asc' }
];

export default function HotelList() {
    const router = useRouter();
    const { city = '上海', checkIn: inTimeStr, checkOut: outTimeStr, keyword = '', tags: tagsStr } = router.params;

    const checkInTimestamp = inTimeStr ? parseInt(inTimeStr as string) : Date.now();
    const checkOutTimestamp = outTimeStr ? parseInt(outTimeStr as string) : (Date.now() + 86400000);

    const [currentCity, setCurrentCity] = useState(decodeURIComponent((city || '上海') as string));
    const [currentCheckIn, setCurrentCheckIn] = useState(checkInTimestamp);
    const [currentCheckOut, setCurrentCheckOut] = useState(checkOutTimestamp);
    const [currentKeyword, setCurrentKeyword] = useState(decodeURIComponent((keyword || '') as string));

    const [showCitySelector, setShowCitySelector] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [sortMode, setSortMode] = useState<'score' | 'price' | 'distance'>('score'); // 独立的排序模式
    const [selectedSortType, setSelectedSortType] = useState('score_desc');

    const [locationTab, setLocationTab] = useState(0);
    const [locationList, setLocationList] = useState<any[]>([]);
    const [priceFilter, setPriceFilter] = useState<{ minPrice: string, maxPrice: string, starRatings: string[] } | null>({ minPrice: '', maxPrice: '', starRatings: [] });
    const [tempPriceFilter, setTempPriceFilter] = useState({ minPrice: '', maxPrice: '', starRatings: [] as string[] });
    const [activeFilterCategory, setActiveFilterCategory] = useState(0);
    const [tempTags, setTempTags] = useState<string[]>([]);
    const [activeTags, setActiveTags] = useState<string[]>(() => {
        try { return tagsStr ? JSON.parse(decodeURIComponent(tagsStr as string)) : []; } catch (e) { return []; }
    });

    const [displayList, setDisplayList] = useState<any[]>([]); // 初始设为空数组
    const [loading, setLoading] = useState(true); // 添加加载状态
    const [selectedLocationName, setSelectedLocationName] = useState(''); // 记录选中的位置名称

    // 分页相关状态
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 获取酒店数据
    const fetchHotels = async (pageNum = 1, isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            Taro.showLoading({ title: '加载中...' });
            setPage(1); //如果您切换筛选条件，重置页码为1
        }

        try {
            const params: any = {
                city: currentCity,
                keyword: currentKeyword,
                area: selectedLocationName, // 传给后端的区域过滤参数
                sort: sortMode === 'score' ? selectedSortType : (sortMode === 'price' ? 'price_asc' : ''),
                page: pageNum,
                limit: 10
            };

            if (priceFilter) {
                if (priceFilter.minPrice) params.minPrice = priceFilter.minPrice;
                if (priceFilter.maxPrice) params.maxPrice = priceFilter.maxPrice;
                if (priceFilter.starRatings.length > 0) params.star = priceFilter.starRatings.join(',');
            }

            if (activeTags.length > 0) params.tags = activeTags.join(',');

            const res = await Taro.request({
                url: '/api/hotels',
                data: params
            });

            if (res.data && res.data.code === 200) {
                const newData = res.data.data;
                if (isLoadMore) {
                    setDisplayList(prev => [...prev, ...newData]);
                } else {
                    setDisplayList(newData);
                }

                // 判断是否还有更多数据 (假设每页10条)
                if (newData.length < 10) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (e) {
            console.error('获取酒店列表失败', e);
        } finally {
            setLoading(false);
            Taro.hideLoading();
        }
    };

    useEffect(() => {
        fetchHotels(1, false);
    }, [priceFilter, activeTags, currentKeyword, sortMode, selectedSortType, selectedLocationName, currentCity]);

    // 触底加载更多
    const handleScrollToLower = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchHotels(nextPage, true);
        }
    };

    const formatShortDate = (timestamp: number) => {
        const d = new Date(timestamp);
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getNights = () => Math.max(1, Math.round((currentCheckOut - currentCheckIn) / 86400000));

    const handleCitySelect = (selectedCity: string) => { setCurrentCity(selectedCity); setShowCitySelector(false); };
    const handleDateConfirm = (start: Date, end: Date) => { setCurrentCheckIn(start.getTime()); setCurrentCheckOut(end.getTime()); setShowCalendar(false); };
    const handlePriceConfirm = () => { setPriceFilter(tempPriceFilter); setActiveDropdown(null); };
    const handlePriceReset = () => setTempPriceFilter({ minPrice: '', maxPrice: '', starRatings: [] });

    const fetchLocationData = (tabIndex: number) => {
        setLocationTab(tabIndex);
        const cityKey = currentCity.replace('市', '');
        let url = '';
        if (tabIndex === 0) url = `/api/location/districts?keywords=${encodeURIComponent(cityKey)}`;
        else if (tabIndex === 1) url = `/api/location/pois?city=${encodeURIComponent(cityKey)}&keywords=${encodeURIComponent('购物中心')}`;
        else if (tabIndex === 2) url = `/api/location/pois?city=${encodeURIComponent(cityKey)}&keywords=${encodeURIComponent('机场|火车站')}&types=150100|150200`;
        else url = `/api/location/pois?city=${encodeURIComponent(cityKey)}&types=110000`;

        Taro.request({
            url
        }).then((res) => {
            if (res.data.code === 200) {
                const data = res.data.data;
                const list = tabIndex === 0 ? data.map((d: any) => ({ name: d.name, id: d.adcode })) : data.map((d: any) => ({ name: d.name, id: d.id }));
                setLocationList(list);
            }
        });
    };

    const handleTagToggle = (tag: string) => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    const renderStars = (count: number) => Array.from({ length: count }, (_, i) => <Text key={i} className='diamond'>💎</Text>);
    const formatFav = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);

    const sortOptions = [{ label: '欢迎度排序', hasArrow: true }, { label: '位置距离', hasArrow: true }, { label: '价格/星级', hasArrow: true }, { label: '筛选', hasArrow: false }];

    const handleSortClick = (index: number) => {
        if (activeDropdown === index) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(index);
            // 只有当面板打开且为特定类型时，才执行初始化
            if (index === 1) fetchLocationData(0);
            else if (index === 2) setTempPriceFilter(priceFilter || { minPrice: '', maxPrice: '', starRatings: [] });
            else if (index === 3) setTempTags([...activeTags]);
        }
    };

    const handleSortOptionClick = (value: string) => {
        setSelectedSortType(value);
        setSortMode('score'); // 切换为主排序模式
        setActiveDropdown(null);
    };
    const handleMoreFilterReset = () => setTempTags([]);
    const handleMoreFilterConfirm = () => { setActiveTags(tempTags); setActiveDropdown(null); };
    const handleTagClickFromPanel = (tag: string) => setTempTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    return (
        <View className='hotel-list-page'>
            <View className='top-bar'>
                <View className='info-capsule'>
                    <Text className='cap-blue' onClick={() => setShowCitySelector(true)}>{currentCity}</Text>
                    <Text className='cap-sep'>|</Text>
                    <View className='date-col' onClick={() => setShowCalendar(true)}>
                        <View className='tiny-row'><Text className='label'>住</Text><Text className='val'>{formatShortDate(currentCheckIn)}</Text></View>
                        <View className='tiny-row'><Text className='label'>离</Text><Text className='val'>{formatShortDate(currentCheckOut)}</Text></View>
                    </View>
                    <Text className='cap-blue' style={{ margin: '0 8px' }}>{getNights()}晚</Text>
                    <Text className='cap-sep'>|</Text>
                    <Input
                        className='cap-keyword-input'
                        placeholder='位置/品牌/酒店'
                        value={currentKeyword}
                        onInput={(e) => setCurrentKeyword(e.detail.value)}
                        onConfirm={(e) => setCurrentKeyword(e.detail.value)}
                        confirmType='search'
                        alwaysEmbed
                    />
                </View>
            </View>

            <View className='filter-container'>
                <View className='sort-bar'>
                    {sortOptions.map((opt, idx) => {
                        let hasValue = false;
                        let displayLabel = opt.label;

                        // 1. 欢迎度排序 (如果当前主排序是 score，则高亮)
                        if (idx === 0) {
                            const currentSort = SORT_DROPDOWN_OPTIONS.find(o => o.value === selectedSortType);
                            if (currentSort) displayLabel = currentSort.label;
                            hasValue = sortMode === 'score';
                        }
                        // 2. 位置 (根据选中名称判断)
                        else if (idx === 1) {
                            hasValue = !!selectedLocationName;
                            if (hasValue) displayLabel = selectedLocationName;
                        }
                        // 3. 价格星级 (有过滤条件则亮，或者是当前正按价格排序也亮)
                        else if (idx === 2) {
                            const hasFilters = !!(priceFilter && (priceFilter.minPrice || priceFilter.maxPrice || (priceFilter.starRatings && priceFilter.starRatings.length > 0)));
                            hasValue = (sortMode === 'price') || hasFilters;
                        }
                        // 4. 更多筛选
                        else if (idx === 3) {
                            hasValue = activeTags.length > 0;
                        }

                        const isActive = activeDropdown === idx;

                        return (
                            <View
                                key={idx}
                                className={`sort-item ${hasValue ? 'selected' : ''} ${isActive ? 'active' : ''}`}
                                onClick={() => handleSortClick(idx)}
                            >
                                <Text className='sort-text'>{displayLabel}</Text>
                                {opt.hasArrow && <Text className={`sort-arrow ${isActive ? 'up' : ''}`}>▼</Text>}
                            </View>
                        );
                    })}
                </View>

                {/* 排序下拉 */}
                {activeDropdown === 0 && (
                    <View className='dropdown-panel sort-dropdown-panel'>
                        {SORT_DROPDOWN_OPTIONS.map((opt, idx) => (
                            <View key={idx} className={`dropdown-item ${selectedSortType === opt.value ? 'active' : ''}`} onClick={() => handleSortOptionClick(opt.value)}>
                                <Text>{opt.label}</Text>
                                {selectedSortType === opt.value && <Text className='check-icon'>✓</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* 位置下拉 */}
                {activeDropdown === 1 && (
                    <View className='location-filter-panel'>
                        <ScrollView scrollY className='left-tabs'>
                            {['行政区', '商圈', '机场车站', '景点'].map((tab, i) => (
                                <View key={i} className={`left-tab ${locationTab === i ? 'active' : ''}`} onClick={() => fetchLocationData(i)}>{tab}</View>
                            ))}
                        </ScrollView>
                        <ScrollView scrollY className='right-list'>
                            {locationList.length > 0 ? locationList.map((item, i) => (
                                <View key={i} className='list-item' onClick={() => {
                                    setSelectedLocationName(item.name);
                                    setActiveDropdown(null);
                                }}>
                                    <Text className='item-name'>{item.name}</Text>
                                </View>
                            )) : <View className='empty-tip'>无数据</View>}
                        </ScrollView>
                    </View>
                )}

                {/* 价格星级下拉 */}
                {activeDropdown === 2 && (
                    <View className='price-star-dropdown-panel'>
                        <ScrollView scrollY className='scroll-content'>
                            <View className='section'>
                                <Text className='section-title'>价格区间</Text>
                                <View className='price-inputs'>
                                    <Input className='price-input' placeholder='最低价' type='number' style={{ textAlign: 'center' }} value={tempPriceFilter.minPrice} onInput={e => setTempPriceFilter({ ...tempPriceFilter, minPrice: e.detail.value })} />
                                    <Text className='divider'>-</Text>
                                    <Input className='price-input' placeholder='最高价' type='number' style={{ textAlign: 'center' }} value={tempPriceFilter.maxPrice} onInput={e => setTempPriceFilter({ ...tempPriceFilter, maxPrice: e.detail.value })} />
                                </View>
                                <View className='tags-grid'>
                                    {PRICE_TAGS.map((tag, i) => <View key={i} className='tag' onClick={() => setTempPriceFilter({ ...tempPriceFilter, minPrice: tag.min, maxPrice: tag.max })}>{tag.label}</View>)}
                                </View>
                            </View>
                            <View className='section'>
                                <Text className='section-title'>星级 (可多选)</Text>
                                <View className='tags-grid'>
                                    {STAR_OPTIONS.map((star, i) => {
                                        const isSelected = tempPriceFilter.starRatings.includes(star.value);
                                        return <View key={i} className={`tag ${isSelected ? 'active' : ''}`} onClick={() => {
                                            const newStars = isSelected ? tempPriceFilter.starRatings.filter(s => s !== star.value) : [...tempPriceFilter.starRatings, star.value];
                                            setTempPriceFilter({ ...tempPriceFilter, starRatings: newStars });
                                        }}>{star.label}</View>
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                        <View className='panel-footer'><View className='btn reset' onClick={handlePriceReset}>重置</View><View className='btn confirm' onClick={handlePriceConfirm}>确定</View></View>
                    </View>
                )}

                {/* 更多筛选 (Index 3) */}
                {activeDropdown === 3 && (
                    <View className='more-filter-panel'>
                        <View className='filter-content-wrapper'>
                            <ScrollView scrollY className='filter-sidebar'>
                                {FILTER_CATEGORIES.map((cat, idx) => (
                                    <View key={cat.id} className={`sidebar-item ${activeFilterCategory === idx ? 'active' : ''}`} onClick={() => setActiveFilterCategory(idx)}>{cat.name}</View>
                                ))}
                            </ScrollView>
                            <ScrollView scrollY className='filter-main' scrollIntoView={`cat-${activeFilterCategory}`} scrollWithAnimation>
                                {FILTER_CATEGORIES.map((cat, idx) => (
                                    <View key={cat.id} id={`cat-${idx}`} className='filter-section'>
                                        <Text className='section-title'>{cat.name}</Text>
                                        <View className='tags-grid'>
                                            {cat.items.map((item, i) => (
                                                <View key={i} className={`filter-tag ${tempTags.includes(item) ? 'active' : ''}`} onClick={() => handleTagClickFromPanel(item)}>{item}</View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                        <View className='panel-footer'><View className='btn reset' onClick={handleMoreFilterReset}>清空</View><View className='btn confirm' onClick={handleMoreFilterConfirm}>完成</View></View>
                    </View>
                )}

                {(activeDropdown !== null) && <View className='dropdown-mask' onClick={() => setActiveDropdown(null)}></View>}
            </View>

            <ScrollView scrollX className='tags-scroll'>
                <View className='tags-inner'>
                    {FILTER_TAGS.map((tag, idx) => <Text key={idx} className={`ftag ${activeTags.includes(tag) ? 'active' : ''}`} onClick={() => handleTagToggle(tag)}>{tag}</Text>)}
                </View>
            </ScrollView>

            <ScrollView scrollY className='hotel-list-scroll' onScrollToLower={handleScrollToLower} lowerThreshold={50}>
                {displayList.map((hotel) => (
                    <View
                        key={hotel.id}
                        className='hotel-card'
                        onClick={() => Taro.navigateTo({ url: `/pages/hotelDetail/index?id=${hotel.id}&city=${encodeURIComponent(currentCity)}&checkIn=${currentCheckIn}&checkOut=${currentCheckOut}` })}
                    >
                        <View className='card-img-wrap'>
                            <Image className='card-img' src={hotel.image} mode='aspectFill' />
                        </View>
                        <View className='card-body'>
                            <View className='name-row'><Text className='hotel-name'>{hotel.name}</Text><View className='stars-wrap'>{renderStars(hotel.star)}</View></View>
                            <View className='score-row'><View className='score-box'><Text className='score-val'>{hotel.score}</Text></View><Text className='score-lbl'>{hotel.scoreLabel}</Text><Text className='meta'>{hotel.reviews}点评 · {formatFav(hotel.favorites)}收藏</Text></View>
                            <Text className='dist'>{hotel.distance}</Text>
                            <Text className='hl'>{hotel.highlight}</Text>
                            <View className='tag-row'>{hotel.tags.slice(0, 4).map((t, i) => <Text key={i} className='htag'>{t}</Text>)}</View>
                            <View className='price-wrap'>
                                <View className='price-row'>
                                    {hotel.originalPrice > hotel.price && <Text className='old-price'>¥{hotel.originalPrice}</Text>}
                                    <Text className='cur-price'><Text className='yen'>¥</Text><Text className='price-big'>{hotel.price}</Text><Text className='qi'>起</Text></Text>
                                </View>
                                {hotel.promoTag && (
                                    <View className='price-promo-tag'>
                                        <Text className='tag-text'>{hotel.promoTag} &gt;</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
                {/* 底部加载提示 */}
                <View className='loading-footer' style={{ padding: '15px 0', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                    {loading ? '加载中...' : (hasMore ? '上滑加载更多' : '没有更多了')}
                </View>
            </ScrollView>

            <CitySelector visible={showCitySelector} onClose={() => setShowCitySelector(false)} onSelect={handleCitySelect} />
            <RangeCalendar visible={showCalendar} onClose={() => setShowCalendar(false)} onConfirm={handleDateConfirm} initialStartDate={new Date(currentCheckIn)} initialEndDate={new Date(currentCheckOut)} />
        </View>
    )
}
