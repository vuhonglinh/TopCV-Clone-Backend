import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';


@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private roleService: RolesService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    // username pass là 2 tham số mặc định của thư viện passport nó ném ra
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (user && isValid) {
                return user
            }
        }
        return null;
    }

    async login({ _id, email, name, role }: IUser, response: Response) {
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            email,
            name,
            role
        };

        const refresh_token = this.createRefreshToken(payload)

        //Update refresh token vào user
        await this.usersService.updateUserToken(refresh_token, _id)


        //Set cookies xuống client
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,//HttpOnly: true; chỉ đọc phía server
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))//Thời gian hết hạn
        })

        const permissions = await this.roleService.findOne(role._id);

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                email,
                name,
                role,
                permissions: permissions.permissions || []
                
            }
        };
    }


    createRefreshToken = (payload) => {//Tạo refresh token
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
        })
        return refresh_token;
    }

    async register({ name, email, address, age, gender, password }: RegisterUserDto) {
        return await this.usersService.register({ name, email, address, age, gender, password })
    }


    async processNewToken(refreshToken: string, response: Response,) {
        try {
            //Kiểm tra nếu lỗi nhảy vào catch
            await this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            })
            const user = await this.usersService.findTokenByToken(refreshToken)

            if (!user) {//Nếu không có user bằng với refreshToken
                throw new BadRequestException("Refresh token không hợp lệ")
            }

            const { _id, name, email, role } = user

            const payload = {
                sub: "token login",
                iss: "from server",
                _id,
                email,
                name,
                role
            };

            //Tạo refreshToken mới
            const refresh_token = this.createRefreshToken(payload)

            //Update refresh token vào user
            await this.usersService.updateUserToken(refresh_token, _id.toString())


            //Xóa cookies cũ
            response.clearCookie("refresh_token")

            //Set cookies xuống client
            response.cookie('refresh_token', refresh_token, {
                httpOnly: true,//HttpOnly: true; chỉ đọc phía server
                maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))//Thời gian hết hạn
            })


            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    _id,
                    email,
                    name,
                    role
                }
            };
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ")
        }
    }


    logout = async ({ _id }: IUser, response: Response) => {
        try {
            await this.usersService.updateUserToken(null, _id);
            response.clearCookie("refresh_token");

            return "Ok"
        } catch (error) {
            throw new BadRequestException("Đăng xuất thất bại");
        }
    }
}
