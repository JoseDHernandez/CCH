import axios from "axios";
import { URL, TOKEN } from "./config";

export const joinParty = async (code) => {
  return await axios.get(`${URL}/lobby/${code}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const partyData = async (code) => {
  return await axios.get(`${URL}/party/${code}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const partyPassword = async (data) => {
  return await axios.post(`${URL}/party`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const updateData = async (data) => {
  return await axios.put(`${URL}/party`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const updatePointsGame = async (data) => {
  return await axios.put(`${URL}/game`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const getNumbersCards = async () => {
  return await axios.get(`${URL}/game`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const startGame = async (data) => {
  return await axios.post(`${URL}/game`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const saveCardsInGame = async (data) => {
  return await axios.post(`${URL}/cards`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const uploadCardsPlay = async (data) => {
  return await axios.put(`${URL}/cards`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const deleteParty = async (data) => {
  return await axios.delete(`${URL}/party`, data, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const getCardsPlay = async (data) => {
  return await axios.get(`${URL}/cartas/${data}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const getCardsInGame = async (data) => {
  return await axios.get(`${URL}/cards/${data}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const updateCardsInGame = async (data) => {
  return await axios.get(`${URL}/cardsOther/${data}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
export const getPoints = async (data) => {
  return await axios.get(`${URL}/points/${data}`, {
    headers: {
      Token: TOKEN,
    },
  });
};
