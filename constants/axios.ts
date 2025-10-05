// lib/axios.ts
import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

export default api