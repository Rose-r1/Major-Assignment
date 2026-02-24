import { View, Text } from '@tarojs/components'
import { useState, useMemo, useEffect } from 'react'
import './index.scss'

interface RangeCalendarProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (startDate: Date, endDate: Date) => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
}

export default function RangeCalendar({ visible, onClose, onConfirm, initialStartDate, initialEndDate }: RangeCalendarProps) {
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate || new Date());
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate || new Date(new Date().setDate(new Date().getDate() + 1)));

    useEffect(() => {
        if (visible) {
            if (initialStartDate) setStartDate(initialStartDate);
            if (initialEndDate) setEndDate(initialEndDate);
        }
    }, [visible, initialStartDate, initialEndDate]);

    const months = useMemo(() => {
        const list: any[] = [];
        const today = new Date();
        // Start from current month
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        for (let i = 0; i < 6; i++) {
            const d = new Date(currentYear, currentMonth + i, 1);
            const y = d.getFullYear();
            const m = d.getMonth();
            const daysInMonth = new Date(y, m + 1, 0).getDate();
            const firstDayWeek = new Date(y, m, 1).getDay(); // 0 is Sunday

            const days: any[] = [];
            // Empty cells for alignment
            for (let j = 0; j < firstDayWeek; j++) {
                days.push(null);
            }
            // Real days
            for (let d = 1; d <= daysInMonth; d++) {
                days.push(new Date(y, m, d));
            }

            list.push({
                year: y,
                month: m + 1,
                days
            });
        }
        return list;
    }, []);

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isBeforeToday = (d: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    }

    const handleDayClick = (date: Date) => {
        if (isBeforeToday(date)) return;

        if (!startDate || (startDate && endDate)) {
            // Start a new selection
            setStartDate(date);
            setEndDate(null);
        } else {
            // We have start date, picking end date
            if (date < startDate) {
                // Picked date is before start date, treat as new start date
                setStartDate(date);
            } else if (isSameDay(date, startDate)) {
                setEndDate(null);
            } else {
                setEndDate(date);
            }
        }
    };

    const getDayClass = (date: Date | null) => {
        if (!date) return 'day-cell empty';

        let classes = ['day-cell'];

        if (isBeforeToday(date)) {
            classes.push('disabled');
            return classes.join(' ');
        }

        if (isSameDay(date, new Date())) classes.push('today');

        // 判断是否相邻（只差1天）
        const isAdjacent = startDate && endDate &&
            Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) === 1;

        if (startDate && isSameDay(date, startDate)) {
            classes.push('range-start');
            if (isAdjacent) classes.push('adjacent');
        }

        if (endDate && isSameDay(date, endDate)) {
            classes.push('range-end');
            if (isAdjacent) classes.push('adjacent');
        }

        if (startDate && endDate && date > startDate && date < endDate) {
            classes.push('in-range');
        }

        return classes.join(' ');
    };

    const getDayStatus = (date: Date | null) => {
        if (!date) return null;
        if (startDate && isSameDay(date, startDate)) return '入住';
        if (endDate && isSameDay(date, endDate)) return '离店';
        return null;
    }

    const handleConfirm = () => {
        if (startDate && endDate) {
            onConfirm(startDate, endDate);
            onClose();
        }
    }

    if (!visible) return null;

    return (
        <View className='calendar-overlay visible'>
            <View className='calendar-container'>
                <View className='header'>
                    <Text className='title'>选择日期</Text>
                    <Text className='close-btn' onClick={onClose}>×</Text>
                </View>

                <View className='week-header'>
                    {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                        <Text key={i} className={`weekday ${i === 0 || i === 6 ? 'weekend' : ''}`}>{d}</Text>
                    ))}
                </View>

                <View className='month-list'>
                    {months.map((m, idx) => (
                        <View key={idx} className='month-section'>
                            <View className='month-title'>{m.year}年{m.month}月</View>
                            <View className='days-grid'>
                                {m.days.map((d: Date | null, dIdx: number) => (
                                    <View
                                        key={dIdx}
                                        className={getDayClass(d)}
                                        onClick={() => d && handleDayClick(d)}
                                    >
                                        {d && (
                                            <>
                                                <Text className='day-num'>{d.getDate()}</Text>
                                                <Text className='day-status'>{getDayStatus(d)}</Text>
                                            </>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                <View className='footer-action'>
                    <View
                        className={`confirm-btn ${(!startDate || !endDate) ? 'disabled' : ''}`}
                        onClick={handleConfirm}
                    >
                        {startDate && endDate
                            ? `确认 (${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}晚)`
                            : '请选择离店日期'
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}
