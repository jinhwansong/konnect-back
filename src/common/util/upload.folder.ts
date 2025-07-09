import fs from 'fs';
import path from 'path';
export const createUploadFolder = (folderName: string = 'uploads') => {
  const filePath = folderName.split('/');
  let currentPath = path.join(__dirname, '..');
  for (const folder of filePath) {
    currentPath = path.join(currentPath, folder);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
};
