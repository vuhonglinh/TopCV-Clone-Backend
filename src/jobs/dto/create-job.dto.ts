import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;


    @IsNotEmpty({ message: "Tên công ty không được để trống" })
    name: string;
}



export class CreateJobDto {
    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Kỹ năng không được để trống" })
    @IsArray({ message: "Kỹ năng phải đúng định dạng" })
    @ArrayNotEmpty({ message: "Danh sách kỹ năng không được để trống" })
    @IsString({ each: true, message: "Mỗi kỹ năng phải là một chuỗi" })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    location: string;

    @IsNotEmpty({ message: "Lương không được để trống" })
    salary: number;

    @IsNotEmpty({ message: "Số lượng không được để trống" })
    quantity: number;

    @IsNotEmpty({ message: "Level không được để trống" })
    level: string;

    @IsNotEmpty({ message: "Mô tả không được để trống" })
    description: string;

    @IsNotEmpty({ message: "Ngày bắt đầu không được để trống" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "Phải có định dạng ngày" })
    startDate: Date;

    @IsNotEmpty({ message: "Ngày kết thúc không được để trống" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "Phải có định dạng ngày" })
    endDate: Date;

    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    @IsBoolean({ message: "Trạng thái có định dạng boolean" })
    isActive: boolean;
}
