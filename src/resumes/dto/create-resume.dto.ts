import { IsMongoId, IsNotEmpty } from "class-validator"
import mongoose from "mongoose"

export class CreateResumeDto {
    @IsNotEmpty({ message: "Url không được để trống" })
    url: string

    @IsNotEmpty({ message: "Trạng thái không được để trống" })
    status: string

    @IsNotEmpty({ message: "Công ty không được để trống" })
    companyId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty({ message: "Công việc không được để trống" })
    jobId: mongoose.Schema.Types.ObjectId

}

export class CreateUserCvDto {
    @IsNotEmpty({ message: "Url không được để trống" })
    url: string

    @IsNotEmpty({ message: "Công ty không được để trống" })
    @IsMongoId({ message: "Công ty không được để trống" })
    companyId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty({ message: "Công việc không được để trống" })
    @IsMongoId({ message: "Công việc không được để trống" })
    jobId: mongoose.Schema.Types.ObjectId
}
