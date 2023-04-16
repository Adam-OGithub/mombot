'use strict';

const fileupload = fileMap => {
  const fileData = new FormData();
  fileMap.forEach((value, key) => {
    fileData.append('fileuploads', value, key);
  });
  return fileData;
};
export { fileupload };
