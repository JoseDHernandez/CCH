import { v4 as Codigo } from "uuid";
import Base64 from "crypto-js/enc-base64.js";
import Utf from "crypto-js/enc-utf8.js";
export const validateEmail = (email) => {
  const regex = new RegExp(
    /^([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])$/
  );
  return regex.test(email);
};
export const validateUser = (User) => {
  const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9]{3,10}$/);
  return regex.test(User);
};
export const validatePassword = (Password) => {
  const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9#$@!?¿]{8,10}$/);
  return regex.test(Password);
};
export const validateUrl = (Url) => {
  const regex = new RegExp(
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
  );
  return regex.test(Url);
};
export const validateTitle = (title) => {
  const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9\s+]{3,50}$/);
  return regex.test(title);
};
export const validateNumber = (number) => {
  const regex = new RegExp(/^[0-9]{1,2}$/);
  return regex.test(number);
};

export const codeParty = () => {
  const code = Base64.stringify(Utf.parse(Codigo()));
  const codeCut = code.slice(0, 15);
  return codeCut;
};
