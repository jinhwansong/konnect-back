import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { createMulterOptions } from "../util/multer.options";

export const createMultiUploadInterceptor = (fields: {name:string; maxCount:number}[], folder:string) => {
    return FileFieldsInterceptor(fields, createMulterOptions(folder))
}