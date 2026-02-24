import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = () => {
        if (!username || !password) {
            Taro.showToast({ title: '请输入账号和密码', icon: 'none' });
            return;
        }

        Taro.showLoading({ title: '登录中...' });

        Taro.request({
            url: 'http://192.168.1.76:5000/api/auth/login', // 请确保地址正确，手机预览可能需要用本机IP
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            success: (res) => {
                Taro.hideLoading();
                if (res.statusCode === 200 && res.data.token) {
                    // 登录成功
                    Taro.setStorageSync('token', res.data.token);
                    Taro.setStorageSync('userInfo', res.data.user);

                    Taro.showToast({ title: '登录成功', icon: 'success' });

                    // 延迟返回，让用户看到成功提示
                    setTimeout(() => {
                        // 登录成功后，跳转到首页
                        Taro.reLaunch({ url: '/pages/index/index' });
                    }, 1500);
                } else {
                    // 登录失败
                    Taro.showToast({
                        title: res.data.message || '登录失败',
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                Taro.hideLoading();
                console.error('Login Request Error:', err);
                Taro.showToast({ title: '网络请求失败', icon: 'none' });
            }
        });
    }

    return (
        <View className='login-page'>
            <View className='header'>
                <Text className='title'>欢迎登录</Text>
                <Text className='subtitle'>开启您的美好旅程</Text>
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
                    <Text className='label'>密码</Text>
                    <Input
                        className='input'
                        type='password'
                        placeholder='请输入密码'
                        placeholderClass='placeholder'
                        value={password}
                        onInput={(e) => setPassword(e.detail.value)}
                    />
                </View>

                <Button className='btn-login' onClick={handleLogin}>登录</Button>

                <View className='footer-links'>
                    <Text className='link' onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}>注册新账号</Text>
                </View>
            </View>
        </View>
    )
}
