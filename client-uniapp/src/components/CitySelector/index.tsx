import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

const HOT_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆', '苏州', '天津', '长沙'];

const CITY_LIST = [
    { title: 'A', cities: ['安庆', '安阳', '鞍山', '安康', '安顺'] },
    { title: 'B', cities: ['北京', '保定', '包头', '本溪', '蚌埠', '北海', '宝鸡', '巴中', '保山'] },
    { title: 'C', cities: ['成都', '重庆', '长沙', '长春', '常州', '沧州', '承德', '赤峰', '朝阳', '滁州', '常德', '潮州', '郴州'] },
    { title: 'D', cities: ['大连', '东莞', '大同', '大庆', '丹东', '东营', '德州', '达州', '大理', '德阳', '定西'] },
    { title: 'F', cities: ['福州', '佛山', '抚顺', '阜新', '阜阳', '抚州'] },
    { title: 'G', cities: ['广州', '贵阳', '桂林', '赣州', '广元', '广安'] },
    { title: 'H', cities: ['杭州', '哈尔滨', '合肥', '呼和浩特', '海口', '邯郸', '衡水', '淮安', '湖州', '黄山', '淮南', '淮北', '衡阳', '怀化', '惠州', '河源', '汉中'] },
    { title: 'J', cities: ['济南', '嘉兴', '金华', '九江', '吉林', '锦州', '鸡西', '佳木斯', '晋中', '景德镇', '济宁', '荆州', '荆门', '江门', '揭阳'] },
    { title: 'K', cities: ['昆明', '开封'] },
    { title: 'L', cities: ['兰州', '拉萨', '廊坊', '临汾', '吕梁', '辽阳', '连云港', '丽水', '六安', '龙岩', '莱芜', '临沂', '聊城', '洛阳', '漯河', '娄底', '柳州', '泸州', '乐山', '丽江', '临沧'] },
    { title: 'M', cities: ['绵阳', '牡丹江', '马鞍山', '茂名', '梅州', '眉山'] },
    { title: 'N', cities: ['南京', '南昌', '南宁', '宁波', '南通', '南阳', '南充', '内江', '南平', '宁德'] },
    { title: 'P', cities: ['平顶山', '盘锦', '莆田', '萍乡', '攀枝花', '普洱'] },
    { title: 'Q', cities: ['青岛', '秦皇岛', '齐齐哈尔', '七台河', '衢州', '泉州', '曲靖', '清远', '钦州', '庆阳'] },
    { title: 'R', cities: ['日照'] },
    { title: 'S', cities: ['上海', '深圳', '沈阳', '石家庄', '苏州', '三亚', '汕头', '绍兴', '宿迁', '宿州', '三明', '上饶', '商丘', '十堰', '随州', '邵阳', '韶关', '遂宁', '汕尾'] },
    { title: 'T', cities: ['天津', '太原', '唐山', '通辽', '铁岭', '通化', '泰州', '台州', '铜陵', '泰安', '铜川', '天水'] },
    { title: 'W', cities: ['武汉', '乌鲁木齐', '无锡', '温州', '芜湖', '威海', '潍坊', '渭南', '梧州'] },
    { title: 'X', cities: ['西安', '厦门', '西宁', '徐州', '邢台', '忻州', '兴安盟', '许昌', '新乡', '信阳', '襄阳', '孝感', '咸宁', '湘潭', '西双版纳'] },
    { title: 'Y', cities: ['银川', '阳泉', '运城', '营口', '延边', '伊春', '盐城', '扬州', '鹰潭', '宜春', '烟台', '宜昌', '岳阳', '益阳', '永州', '玉林', '宜宾', '雅安', '延安', '榆林', '玉树'] },
    { title: 'Z', cities: ['郑州', '珠海', '张家口', '镇江', '舟山', '漳州', '淄博', '枣庄', '周口', '驻马店', '株洲', '张家界', '自贡', '资阳', '遵义', '昭通', '张掖', '中卫'] }
];

interface CitySelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (city: string) => void;
}

export default function CitySelector({ visible, onClose, onSelect }: CitySelectorProps) {
    const [scrollIntoView, setScrollIntoView] = useState('');
    const [locationCity, setLocationCity] = useState('定位中...');

    useEffect(() => {
        if (visible) {
            handleGetLocation();
        }
    }, [visible]);

    const handleGetLocation = () => {
        setLocationCity('定位中...');
        Taro.getLocation({
            type: 'wgs84',
            success: (res) => {
                // 调用后端接口
                Taro.request({
                    url: 'http://localhost:5000/api/location/reverse-geocode',
                    method: 'GET',
                    data: {
                        lat: res.latitude,
                        lng: res.longitude
                    },
                    success: (apiRes) => {
                        if (apiRes.statusCode === 200 && apiRes.data.code === 200) {
                            const addressComponent = apiRes.data.data.addressComponent;
                            let newCity = addressComponent.city;
                            const province = addressComponent.province;

                            if (Array.isArray(newCity) || !newCity) {
                                newCity = (typeof province === 'string' && province.length > 0) ? province : '';
                            }

                            if (typeof newCity === 'string' && newCity) {
                                if (newCity.endsWith('市')) {
                                    newCity = newCity.slice(0, -1);
                                }
                                setLocationCity(newCity);
                            } else {
                                setLocationCity('定位失败');
                            }
                        } else {
                            setLocationCity('定位失败');
                        }
                    },
                    fail: () => {
                        setLocationCity('定位失败');
                    }
                });
            },
            fail: () => {
                // H5 或权限拒绝
                setLocationCity('定位失败');
            }
        });
    };

    if (!visible) return null;

    const handleCityClick = (city: string) => {
        if (city === '定位中...' || city === '定位失败') {
            if (city === '定位失败') handleGetLocation(); // 点击失败重试
            return;
        }
        onSelect(city);
        onClose();
    }

    const handleIndexClick = (id: string, e) => {
        e.stopPropagation();
        setScrollIntoView(id);
    }

    return (
        <View className='city-selector-modal'>
            <View className='mask' onClick={onClose}></View>
            <View className='content'>
                <View className='header'>
                    <Text className='title'>选择城市</Text>
                    <Text className='close' onClick={onClose}>×</Text>
                </View>

                {/* 顶部搜索栏 */}
                <View className='search-bar'>
                    <View className='search-input-box'>
                        <Text className='placeholder'>城市/拼音</Text>
                    </View>
                </View>

                <View className='body'>
                    <ScrollView
                        scrollY
                        scrollIntoView={scrollIntoView}
                        scrollWithAnimation
                        className='city-scroll-view'
                    >
                        {/* 当前定位 */}
                        <View id="CURRENT" className='section'>
                            <Text className='section-title'>当前定位</Text>
                            <View className='grid-list'>
                                <View className='grid-item' style={{ minWidth: 'auto', padding: '10px 20px', height: 'auto', flexDirection: 'column' }} onClick={() => handleCityClick(locationCity)}>
                                    {locationCity === '定位中...' ? '定位中...' : locationCity === '定位失败' ? (
                                        <>
                                            <Text>定位失败</Text>
                                            <Text style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>(点击重试)</Text>
                                        </>
                                    ) : `${locationCity}`}
                                </View>
                            </View>
                        </View>

                        {/* 热门城市 */}
                        <View id="HOT" className='section'>
                            <Text className='section-title'>热门城市</Text>
                            <View className='grid-list'>
                                {HOT_CITIES.map(city => (
                                    <View key={city} className='grid-item' onClick={() => handleCityClick(city)}>
                                        {city}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* 字母列表 */}
                        {CITY_LIST.map(group => (
                            <View key={group.title} id={group.title} className='section'>
                                <Text className='section-title'>{group.title}</Text>
                                <View className='list-container'>
                                    {group.cities.map(city => (
                                        <View key={city} className='list-item' onClick={() => handleCityClick(city)}>
                                            {city}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                        <View style={{ height: '50px' }}></View>
                    </ScrollView>

                    {/* 右侧索引栏 */}
                    <View className='index-bar'>
                        <View onClick={(e) => handleIndexClick('CURRENT', e)}>定</View>
                        <View onClick={(e) => handleIndexClick('HOT', e)}>热</View>
                        {CITY_LIST.map(g => (
                            <View key={g.title} onClick={(e) => handleIndexClick(g.title, e)}>
                                {g.title}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    )
}
