import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import fs from "fs";
import { diskStorage } from "multer";
import path, { join } from "path";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    //Trả ra đường link thư mục root
    getRootPath = () => {
        return process.cwd();
    };

    //Nếu thư mục không tồn tại sẽ tạo mới và ngược lại
    ensureExists(targetDirectory: string) {
        //Nhận 3 đối số: 
        //   targetDirectory: Đường dẫn tới thư mục cần tạo.
        //   { recursive: true }: Tùy chọn này chỉ định rằng Node.js sẽ tạo tất cả các thư mục cha (nếu chưa tồn tại).
        //   Callback function: Hàm này sẽ được gọi khi fs.mkdir hoàn tất hoặc gặp lỗi.

        //fs.mkdir là một hàm bất đồng bộ trong Node.js dùng để tạo thư mục. 
        fs.mkdir(targetDirectory, { recursive: true }, (error) => {
            if (!error) {
                console.log('Directory successfully created, or it already exists.');
                return;
            }
            switch (error.code) {
                case 'EEXIST':
                    // Error:
                    //Lỗi này xảy ra khi đường dẫn yêu cầu đã tồn tại, nhưng nó không phải là một thư mục.
                    break;
                case 'ENOTDIR':
                    // Error:
                    // Lỗi này xảy ra khi một tệp trong hệ thống tệp có cùng tên với thư mục bạn đang cố gắng tạo.
                    break;
                default:
                    //Xử lý các lỗi khác (ví dụ: quyền truy cập bị từ chối). In lỗi ra bảng điều khiển.
                    console.error(error);
                    break;
            }
        });
    }

    //Lưu tại đâu
    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                //Nơi lưu trữ
                destination: (req, file, cb) => {
                    const folder = req?.headers?.folder_type ?? "default";
                    this.ensureExists(`public/images/${folder}`);
                    cb(null, join(this.getRootPath(), `public/images/${folder}`))
                },
                //Đổi tên file
                filename: (req, file, cb) => {
                    //get image extension
                    let extName = path.extname(file.originalname);
                    //get image's name (without extension)
                    let baseName = path.basename(file.originalname, extName);
                    let finalName = `${baseName}-${Date.now()}${extName}`
                    cb(null, finalName)
                },
            }),
            fileFilter: (req, file, cb) => {
                const allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
                const fileExtension = file.originalname.split('.').pop().toLowerCase();
                const isValidFileType = allowedFileTypes.includes(fileExtension);
                if (!isValidFileType) {
                    cb(new HttpException('Invalid file type', HttpStatus.UNPROCESSABLE_ENTITY), null);
                } else
                    cb(null, true);
            },
            limits: {
                fileSize: 1024 * 1024 * 1 // 1MB
            }

        };
    }

}