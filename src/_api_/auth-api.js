import axios from 'axios';

export class CustomError extends Error {
  custom;

  constructor(message, custom) {
    super(message);
    this.custom = custom;
  }
}

export function parseError(error, fallbackCode = '500') {

  if (error?.response?.data?.message) { // node js axios errors
    return new CustomError(error.response.data.message, String(error.response.data.statusCode));
  }
  if (error?.response?.data) { // client side axios errors
    return new CustomError(error.response.data, error.response.status?String(error.response.status):fallbackCode);
  }
  if (error.custom) {
    return error;
  } 
  return new CustomError(error.message, fallbackCode )
}

class AuthApi {

  getFriends(handcashToken) {
    return new Promise((resolve, reject) => {
      const errorHandling = (err)=>{ 
        console.log(err);
        const e = parseError(err);
        console.log('[Auth Api]: ', e.message);
        reject(e);
      };
      try { 
        axios.get('/api/handcash/getFriends', { headers: { handcashToken } }).then((res)=>{
          if (!res.data) {
            reject(new Error('Invalid authorization token'));
            return;
          } 
          resolve(res.data);
        }).catch(errorHandling)
      } catch (err) {
        errorHandling(err);
      } 
    });
  }

  getProfile(handcashToken) {
    return new Promise((resolve, reject) => {
      const errorHandling = (err)=>{ 
        const e = parseError(err);
        console.log('[Auth Api]: ', e.message);
        reject(e);
      };

      try { 
        axios.get('/api/handcash/getProfile', { headers: { handcashToken } }).then((res)=>{
          if (!res.data) {
            reject(new Error('Invalid authorization token'));
            return;
          } 
          resolve(res.data);
        }).catch(errorHandling)
      } catch (err) {
        errorHandling(err);
      } 
    });
  }
}

export const authApi = new AuthApi();
