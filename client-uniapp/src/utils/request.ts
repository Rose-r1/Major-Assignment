import Taro from '@tarojs/taro';
import { API_BASE_URL } from '../config';

/**
 * 封装 Taro.request
 */
interface RequestOptions<T extends string | Record<string, any> | ArrayBuffer = any> extends Taro.request.Option<T> {
    url: string;
}

export const request = <T extends string | Record<string, any> | ArrayBuffer = any>(options: RequestOptions<T>): Promise<Taro.request.SuccessCallbackResult<any>> => {
    const { url, ...rest } = options;

    // 拼接基础域名
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

    const token = Taro.getStorageSync('token');

    const header = {
        'Content-Type': 'application/json',
        ...rest.header,
    };

    if (token) {
        header['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        Taro.request({
            ...rest,
            url: fullUrl,
            header,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res);
                } else if (res.statusCode === 401) {
                    // Token 过期或无效
                    Taro.removeStorageSync('token');
                    Taro.removeStorageSync('userInfo');
                    Taro.showToast({
                        title: '登录已过期',
                        icon: 'none'
                    });
                    setTimeout(() => {
                        Taro.reLaunch({ url: '/pages/login/index' });
                    }, 1500);
                    reject(res);
                } else {
                    reject(res);
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
};

export default request;
