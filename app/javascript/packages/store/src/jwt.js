export const parseJwt = (token) => {
  const result = decodeURIComponent(escape(window.atob(token)));
  return {data: JSON.parse(result)};
};

export const generateJWT = (data) => {
  return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
};