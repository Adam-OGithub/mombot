'use strict';
const aKeyLessOpt = (url, postData) => {
  return {
    hostname: '',
    port: '',
    path: url,
    method: 'POST',
    rejectUnauthorized: true,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      Accept: 'application/json',
    },
  };
};
