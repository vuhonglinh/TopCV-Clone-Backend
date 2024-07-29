import { IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateSubscriberDto {

    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string

    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsNotEmpty({ message: "Kỹ năng không được để trống" })
    @IsArray({ message: "Kỹ năng phải là dạng mảng" })
    @IsString({ each: true, message: "Kỹ năng không đúng định dạng" })
    skills: string[]
}
