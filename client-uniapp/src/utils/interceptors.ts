import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../config'

/**
 * URL 拦截器：自动拼接域名
 */
const baseUrlInterceptor = (chain) => {
    const requestParams = chain.requestParams
    const { url } = requestParams

    // 如果是相对路径且非 http 开头，自动拼接域名
    if (!url.startsWith('http')) {
        requestParams.url = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
    }

    return chain.proceed(requestParams)
}

/**
 * Token 拦截器：自动注入 Authorization
 */
const tokenInterceptor = (chain) => {
    const requestParams = chain.requestParams
    const token = Taro.getStorageSync('token')

    if (token) {
        requestParams.header = {
            ...requestParams.header,
            'Authorization': `Bearer ${token}`
        }
    }

    return chain.proceed(requestParams)
}

/**
 * 响应拦截器：处理登录失效
 */
const responseInterceptor = (chain) => {
    return chain.proceed(chain.requestParams).then(res => {
        if (res.statusCode === 401) {
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
            Taro.showToast({
                title: '登录已过期',
                icon: 'none'
            })
            setTimeout(() => {
                Taro.reLaunch({ url: '/pages/login/index' })
            }, 1500)
        }
        return res
    })
}

export const interceptors = [
    baseUrlInterceptor,
    tokenInterceptor,
    responseInterceptor
]
