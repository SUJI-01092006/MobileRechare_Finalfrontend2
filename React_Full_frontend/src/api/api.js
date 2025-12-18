import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // backend URL
  withCredentials: true,
});

export default API;
