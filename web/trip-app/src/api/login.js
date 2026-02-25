import request from './index';

export const login = (username, password) => {
  return request.post('/auth/login', { username, password });
}

export const register = ({username, password, nickname, role}) => {
  return request.post('/auth/register', { username, password, nickname, role });
}