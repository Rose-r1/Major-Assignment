import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { interceptors } from './utils/interceptors'

import './app.scss'

// 注入拦截器
interceptors.forEach(interceptor => Taro.addInterceptor(interceptor))

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}



export default App
