import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [nickname, setNickname] = useState('')

    const handleRegister = () => {
        if (!username || !password || !confirmPassword) {
            Taro.showToast({ title: '请填写完整信息', icon: 'none' });
            return;
        }

        if (password !== confirmPassword) {
            Taro.showToast({ title: '两次输入的密码不一致', icon: 'none' });
            return;
        }

        Taro.showLoading({ title: '注册中...' });

        Taro.request({
            url: 'http://localhost:5000/api/auth/register',
            method: 'POST',
            data: {
                username,
                password,
                nickname: nickname || `用户${username.slice(-4)}` // 默认昵称
            },
            success: (res) => {
                Taro.hideLoading();
                if (res.statusCode === 201 || res.statusCode === 200) {
                    Taro.showToast({ title: '注册成功', icon: 'success' });

                    // 延迟返回登录页
                    setTimeout(() => {
                        Taro.navigateBack();
                    }, 1500);
                } else {
                    Taro.showToast({
                        title: res.data.message || '注册失败',
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                Taro.hideLoading();
                console.error('Register Request Error:', err);
                Taro.showToast({ title: '网络请求失败', icon: 'none' });
            }
        });
    }

    return (
        <View className='register-page'>
            <View className='header'>
                <Text className='title'>新用户注册</Text>
                <Text className='subtitle'>很高兴认识你</Text>
            </View>

            <View className='form-container'>
                <View className='input-group'>
                    <Text className='label'>账号</Text>
                    <Input
                        className='input'
                        placeholder='请输入账号'
                        placeholderClass='placeholder'
                        value={username}
                        onInput={(e) => setUsername(e.detail.value)}
                    />
                </View>

                <View className='input-group'>
                    <Text className='label'>昵称</Text>
                    <Input
                        className='input'
                        placeholder='请输入昵称 (选填)'
                        placeholderClass='placeholder'
                        value={nickname}
                        onInput={(e) => setNickname(e.detail.value)}
                    />
                </View>

                <View className='input-group'>
                    <Text className='label'>密码</Text>
                    <Input
                        className='input'
                        type='password'
                        placeholder='设置登录密码'
                        placeholderClass='placeholder'
                        value={password}
                        onInput={(e) => setPassword(e.detail.value)}
                    />
                </View>

                <View className='input-group'>
                    <Text className='label'>确认密码</Text>
                    <Input
                        className='input'
                        type='password'
                        placeholder='再次输入密码'
                        placeholderClass='placeholder'
                        value={confirmPassword}
                        onInput={(e) => setConfirmPassword(e.detail.value)}
                    />
                </View>

                <Button className='btn-register' onClick={handleRegister}>注册</Button>

                <View className='footer-links'>
                    <Text className='link' onClick={() => Taro.navigateBack()}>已有账号？去登录</Text>
                </View>
            </View>
        </View>
    )
}
