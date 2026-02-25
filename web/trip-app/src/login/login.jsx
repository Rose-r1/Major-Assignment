import { useState } from 'react'
import { Input, Button, Radio } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login, register } from '../api/login'
import './login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [role, setRole] = useState('merchant')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      alert('请输入账号与密码')
      return
    }
    if (isLogin) {
      // 登录
      try {
        const res = await login(username, password);
        if (res && res.code === 200) {
          const { token, user } = res;
          if (user?.role !== 'admin' && user?.role !== 'merchant') {
            alert('无权限登录：仅限管理员或商户');
            return;
          }
          localStorage.setItem('token', token);
          localStorage.setItem('role', user?.role || '');
          onLogin(token, user?.role);
        } else {
          alert(res?.msg || '登录失败');
        }
      } catch (err) {
        alert('登录接口异常');
        console.error(err);
      }
    } else {
      // 注册
      try {
        const res = await register({ username, password, nickname, role });
        if (res && res.code === 200) {
          alert('注册成功，请登录');
          setIsLogin(true);
        } else {
          alert(res?.msg || '注册失败');
        }
      } catch (err) {
        alert('注册接口异常');
      }
    }
  }

  const switchForm = () => {
    setIsLogin(l => !l)
  }

  return (
    <div className="login-root">
      <div className={`login-card ${isLogin ? '' : 'active'}`}>

        {/* ===== 左：注册 ===== */}
        <div className="form register">
          <h2 className="title">注册</h2>
          <Input
            className="input"
            placeholder="请输入账户名称"
            suffix={<UserOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            className="input"
            placeholder="请输入账户密码"
            suffix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            className="input"
            placeholder="[选填] 昵称"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            style={{ marginTop: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <span style={{ marginRight: 8 }}>角色：</span>
            <Radio.Group value={role} onChange={e => setRole(e.target.value)}>
              <Radio value="merchant">商户</Radio>
              <Radio value="admin">管理员</Radio>
            </Radio.Group>
          </div>
          <Button type="primary" onClick={handleSubmit} className="login-btn">注册</Button>
        </div>

        {/* ===== 右：登录 ===== */}
        <div className="form login">
          <h2 className="title">登入</h2>
          <Input
            className="input"
            placeholder="请输入账户名称"
            suffix={<UserOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            className="input"
            placeholder="请输入账户密码"
            suffix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="primary" onClick={handleSubmit} className="login-btn">登入</Button>
        </div>

        {/* 滑动遮罩层 */}
        <div className="overlay">
          <div className="overlay-panel">
            {isLogin ? (
              <>
                <h2>Hello, Welcome!</h2>
                <p>还没有账户？</p>
                <Button ghost onClick={switchForm}>注册</Button>
              </>
            ) : (
              <>
                <h2>Welcome Back!</h2>
                <p>已有账户？</p>
                <Button ghost onClick={switchForm}>登入</Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login