'use strict';
const createReq = async (url, objectData, fileupload) => {
  let data = '';
  if (fileupload !== undefined) {
    data = await fetch(url, {
      method: 'POST',
      headers: { inputdata: JSON.stringify(objectData), fileupload: true },
      body: fileupload,
    }).catch(e => {
      console.log('Request error:', e);
    });
  } else {
    data = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objectData),
    }).catch(e => {
      console.log('Request error:', e);
    });
  }
  return data.json();
};

const webReq = async (url, requestData, fileupload) => {
  const dataToJson = await createReq(url, requestData, fileupload);
  return dataToJson;
};

export { webReq };
