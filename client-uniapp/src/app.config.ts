// Rebuild trigger: 2026-02-24 15:00
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/register/index',
    'pages/city/index',
    'pages/hotelList/index',
    'pages/hotelDetail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置将用于获取您所在城市的酒店信息'
    }
  },
  requiredPrivateInfos: [
    'getLocation'
  ]
})
