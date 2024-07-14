import axios from "axios";
import { URL, TOKEN } from "./config";

export const newUserRequest = async (user) =>
  await axios.post(`${URL}/signup`, user);
export const loginUserRequest = async (user) =>
  await axios.post(`${URL}/signin`, user);
export const logrosUserRequest = async (id) =>
  await axios.get(`${URL}/user/${id}`, {
    headers: {
      token: TOKEN,
    },
  });
