import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

//Giống với Request trong laravel


class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;


    @IsNotEmpty({ message: "Tên công ty không được để trống" })
    name: string;
}




export class CreateUserDto {
    @IsEmail({}, {
        message: "Email không đúng định dạng!"
    })
    @IsNotEmpty({
        message: "Email không được để trống!"
    })
    email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    password: string;

    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    address: string;


    @IsNotEmpty({ message: "Tuổi tính không được để trống" })
    age: number;

    @IsNotEmpty({ message: "Giới tính không được để trống" })
    gender: string;

    @IsNotEmpty({ message: "Vai trò không được để trống" })
    @IsMongoId({ message: "Role có định không đúng định dạng Id" })
    role: mongoose.Types.ObjectId;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}


export class RegisterUserDto {
    @IsEmail({}, {
        message: "Email không đúng định dạng!"
    })
    @IsNotEmpty({
        message: "Email không được để trống!"
    })
    email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    password: string;

    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    address: string;


    @IsNotEmpty({ message: "Tuổi tính không được để trống" })
    age: number;

    @IsNotEmpty({ message: "Giới tính không được để trống" })
    gender: string;

}


export class UserLoginDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'vulinh18072k1@gmail.com', description: 'username' })
    readonly username: string;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456',
        description: 'password',
    })
    readonly password: string;

}