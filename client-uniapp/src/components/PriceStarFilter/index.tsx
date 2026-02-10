import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

interface PriceStarFilterProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (result: { minPrice: string, maxPrice: string, starRatings: string[] }) => void;
}

const PRICE_TAGS = [
    { label: '¥150以下', min: '0', max: '150' },
    { label: '¥150-¥300', min: '150', max: '300' },
    { label: '¥300-¥450', min: '300', max: '450' },
    { label: '¥450-¥600', min: '450', max: '600' },
    { label: '¥600-¥1000', min: '600', max: '1000' },
    { label: '¥1000以上', min: '1000', max: '' }
];

const STAR_OPTIONS = [
    { label: '2钻/星', sub: '经济', value: '2' },
    { label: '3钻/星', sub: '舒适', value: '3' },
    { label: '4钻/星', sub: '高档', value: '4' },
    { label: '5钻/星', sub: '豪华', value: '5' },
    { label: '金钻酒店', sub: '奢华体验', value: 'gold' },
    { label: '铂钻酒店', sub: '超奢品质', value: 'platinum' }
];

export default function PriceStarFilter({ visible, onClose, onConfirm }: PriceStarFilterProps) {
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedStars, setSelectedStars] = useState<string[]>([]);

    if (!visible) return null;

    const handlePriceTagClick = (tag: typeof PRICE_TAGS[0]) => {
        setMinPrice(tag.min);
        setMaxPrice(tag.max);
    };

    const handleStarClick = (value: string) => {
        if (selectedStars.includes(value)) {
            setSelectedStars(selectedStars.filter(s => s !== value));
        } else {
            setSelectedStars([...selectedStars, value]);
        }
    };

    const handleClear = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedStars([]);
    };

    const handleConfirm = () => {
        onConfirm({ minPrice, maxPrice, starRatings: selectedStars });
        onClose();
    };

    return (
        <View className='price-star-modal'>
            <View className='mask' onClick={onClose}></View>
            <View className='content'>
                <View className='header'>
                    <Text className='close' onClick={onClose}>×</Text>
                    <Text className='title'>选择价格/星级</Text>
                    <View style={{ width: '40px' }}></View>
                </View>

                <ScrollView scrollY className='body'>

                    {/* 价格部分 */}
                    <View className='section'>
                        <View className='row-title'>
                            <Text className='section-title'>价格</Text>
                        </View>


                        <View className='price-inputs'>
                            <View className='input-wrapper'>
                                <Input
                                    className='input'
                                    value={minPrice}
                                    onInput={e => setMinPrice(e.detail.value)}
                                    type='number'
                                    placeholder='最低价'
                                    placeholderStyle='color:#ccc;'
                                />
                            </View>
                            <Text className='divider'>—</Text>
                            <View className='input-wrapper'>
                                <Input
                                    className='input'
                                    value={maxPrice}
                                    onInput={e => setMaxPrice(e.detail.value)}
                                    type='number'
                                    placeholder='最高价'
                                    placeholderStyle='color:#ccc;'
                                />
                            </View>
                        </View>

                        <View className='tags-grid'>
                            {PRICE_TAGS.map((tag, i) => {
                                const isSelected = minPrice === tag.min && maxPrice === tag.max;
                                return (
                                    <View
                                        key={i}
                                        className={`tag ${isSelected ? 'active' : ''}`}
                                        onClick={() => handlePriceTagClick(tag)}
                                    >
                                        {tag.label}
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                    {/* 星级部分 */}
                    <View className='section'>
                        <View className='row-title'>
                            <Text className='section-title'>星级/钻级</Text>
                        </View>

                        <View className='stars-grid'>
                            {STAR_OPTIONS.map((star, i) => (
                                <View
                                    key={i}
                                    className={`star-item ${selectedStars.includes(star.value) ? 'active' : ''}`}
                                    onClick={() => handleStarClick(star.value)}
                                >
                                    <Text className='main'>{star.label}</Text>
                                    <Text className='sub'>{star.sub}</Text>
                                </View>
                            ))}
                        </View>
                        <View className='info-text'>
                            酒店未参加星级评定但设施服务达到相应水平，采用钻级分类，仅供参考
                        </View>
                    </View>

                    {/* 底部占位，防止被 footer 遮挡 */}
                    <View className='body-bottom-spacer'></View>

                </ScrollView>

                {/* 底部按钮 */}
                <View className='footer'>
                    <View className='btn reset' onClick={handleClear}>清空</View>
                    <View className='btn confirm' onClick={handleConfirm}>完成</View>
                </View>
            </View>
        </View>
    )
}
