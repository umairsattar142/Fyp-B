import axios from 'axios';

const baseUrl = 'https://rare-finds.vercel.app/api/';

const setToken = async (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.clear();
  }
};

const request = async (endpoint, method = 'GET', data) => {
  try {
    const url = `${baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      url,
      method,
      headers,
      data
    };

    const response = await axios(config);

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

const exec = async (endpoint, data, method = 'POST') => {
  return request(endpoint, method, data);
};

const getUser = async () => {
  try {
    const res = await request('users/profile', 'GET');
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { setToken, request, exec, getUser };
