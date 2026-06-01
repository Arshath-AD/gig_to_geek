import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api/v1';
// 10.0.2.2 → host machine from Android emulator
// For iOS simulator / physical device change to your LAN IP, e.g. http://192.168.x.x:8000/api/v1

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Attach JWT on every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('gg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
