import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateRoleDto {
    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string

    @IsNotEmpty({ message: "Mô tả không được để trống" })
    description: string

    @IsNotEmpty({ message: "isActive không được để trống" })
    isActive: boolean


    @IsNotEmpty({ message: "Roles không được để trống" })
    @IsArray({ message: "Roles phải là một mảng" })
    @ArrayNotEmpty({ message: "Roles không được để trống" })
    @IsString({ each: true, message: "Mỗi phần tử của Roles phải là chuỗi" })
    permissions: string[];
}
