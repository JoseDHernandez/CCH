import io from "socket.io-client";
export const URL = "http://localhost:3000"; //URL of the server API
export const TOKEN = localStorage.getItem("token");
export const socket = io(URL);
