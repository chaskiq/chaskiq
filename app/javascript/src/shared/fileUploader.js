import { FileChecksum } from "activestorage/src/file_checksum";

function calculateChecksum(file) {
  return new Promise((resolve, reject) => {
    FileChecksum.create(file, (error, checksum) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(checksum);
    });
  });
}


export const getFileMetadata = (file) => {
  return new Promise((resolve) => {
    calculateChecksum(file).then((checksum) => {
      resolve({
        checksum,
        filename: file.name,
        contentType: file.type,
        byteSize: file.size
      });    
    });
  });
};