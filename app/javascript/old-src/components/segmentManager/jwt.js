import KJUR from "jsrsasign"

export const parseJwt = (token)=> {
  var isValid = KJUR.jws.JWS.verifyJWT(token, "616161", {alg: ['HS256']});
  if(!isValid)
    return new Error("not a valid jwt, sory")

  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

export const generateJWT = (data)=>{
  var oHeader = {alg: 'HS256', typ: 'JWT'};
  // Payload
  var oPayload = {};
  var tNow = KJUR.jws.IntDate.get('now');
  var tEnd = KJUR.jws.IntDate.get('now + 1day');
  oPayload.data = data
  // Sign JWT, password=616161
  var sHeader = JSON.stringify(oHeader);
  var sPayload = JSON.stringify(oPayload);
  var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "616161")
  return sJWT
}