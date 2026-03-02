import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface ChatDialogProps {
    visible: boolean;
    onClose: () => void;
    hotelId: string;
    hotelName: string;
}

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    time: string;
}

export default function ChatDialog({ visible, onClose, hotelId, hotelName }: ChatDialogProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: Date.now(), text: `您好！我是${hotelName}的智能助手，请问有什么可以帮您的？`, isUser: false, time: formatTime(new Date()) }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(''); // 存储会话 ID

    function formatTime(date: Date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now(),
            text: inputValue,
            isUser: true,
            time: formatTime(new Date())
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setLoading(true);

        try {
            const res = await Taro.request({
                url: '/api/chat/hotel',
                method: 'POST',
                data: {
                    message: userMsg.text,
                    hotelId,
                    hotelName,
                    conversationId: currentConversationId // 发送当前会话 ID
                }
            });

            if (res.data && res.data.code === 200) {
                // 更新会话 ID
                if (res.data.conversation_id) {
                    setCurrentConversationId(res.data.conversation_id);
                }

                // 提取回复文本
                const responseData = res.data.data;
                const botText = (typeof responseData === 'object' ? responseData.text : responseData) || '收到，我会尽快处理。';

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: botText,
                    isUser: false,
                    time: formatTime(new Date())
                }]);
            } else {
                Taro.showToast({ title: '助手暂时离开，请稍后再试', icon: 'none' });
            }
        } catch (e) {
            Taro.showToast({ title: '网络异常', icon: 'none' });
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <View className='chat-dialog-mask' onClick={onClose}>
            <View className='chat-container' onClick={e => e.stopPropagation()}>
                <View className='chat-header'>
                    <Text className='title'>问酒店 - {hotelName}</Text>
                    <Text className='close-btn' onClick={onClose}>×</Text>
                </View>

                <ScrollView scrollY className='chat-body' scrollIntoView={`msg-${messages[messages.length - 1]?.id}`}>
                    {messages.map((msg) => (
                        <View key={msg.id} id={`msg-${msg.id}`} className={`message-item ${msg.isUser ? 'user' : 'bot'}`}>
                            {!msg.isUser && <View className='avatar'>🏨</View>}
                            <View className='content-wrap'>
                                <View className='bubble'>{msg.text}</View>
                                <Text className='time'>{msg.time}</Text>
                            </View>
                            {msg.isUser && <View className='avatar user'>👤</View>}
                        </View>
                    ))}
                    {loading && (
                        <View className='message-item bot'>
                            <View className='avatar'>🏨</View>
                            <View className='content-wrap'>
                                <View className='bubble loading'>正在输入...</View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View className='chat-footer'>
                    <Input
                        className='chat-input'
                        placeholder='输入您想咨询的问题...'
                        value={inputValue}
                        onInput={e => setInputValue(e.detail.value)}
                        onConfirm={handleSend}
                        confirmType='send'
                        adjustPosition
                        cursorSpacing={20}
                    />
                    <View className={`send-btn ${inputValue.trim() ? 'active' : ''}`} onClick={handleSend}>发送</View>
                </View>
            </View>
        </View>
    );
}
