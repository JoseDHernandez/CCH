import axios from "axios";
import { URL } from "./config";
export const getCardsBlackRequest = async () =>
  await axios.get(`${URL}/cardsBlack`);
export const createCardsBlackRequest = async (card) =>
  await axios.post(`${URL}/cardsBlack`, card);
export const deleteCardRequest = async (id) =>
  await axios.delete(`${URL}/cardsBlack/${id}`);
//Cartas blancas
export const getCardsWhiteRequest = async () =>
  await axios.get(`${URL}/cardsWhite`);
