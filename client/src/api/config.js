import io from "socket.io-client";
export const URL = "http://localhost:3000";
export const TOKEN = localStorage.getItem("token");
export const urlSocket = "http://localhost:3000";
export const socket = io(urlSocket);
