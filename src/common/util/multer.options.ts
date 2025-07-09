import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import path from "path";
import { v4 as uuid } from 'uuid';
import { createUploadFolder } from "./upload.folder";

export const createMulterOptions = (folder:string):MulterOptions  => {
    createUploadFolder(folder)
    return{
        storage:diskStorage({
            destination:folder,
            filename:(req,file,cb)=>{
                const ext = path.extname(file.originalname)
                const filename = `${uuid()}${ext}`
                cb(null, filename)
            }
        }),
        limits: {fileSize: 5 * 1024 * 1024},
        fileFilter:(req,file,cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('지원하지 않는 이미지 형식입니다'), false);
            }
        }
    }
}