export const validateTitle = (title) => {
  const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9\s+]{3,50}$/);
  return regex.test(title);
};
export const validateNumber = (number) => {
  const regex = new RegExp(/^[0-9]{1,2}$/);
  return regex.test(number);
};
export const validatePassword = (Password) => {
  const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9#$@!?¿]{8,10}$/);
  return regex.test(Password);
};
export const validateCode = (code) => {
  const codeRegex = new RegExp(/^[a-zA-Z0-9]{15}$/);
  return codeRegex.test(code);
};
