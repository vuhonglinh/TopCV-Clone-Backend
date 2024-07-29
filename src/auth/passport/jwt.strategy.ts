import { RolesService } from './../../roles/roles.service';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private roleService: RolesService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
        });
    }

    async validate({ _id, email, name, role }: IUser) {
        //giải mã token dũ liệu trả về

        //Gán thêm permissions vào req.user
        const permissions = await this.roleService.findOne(role._id);

        return {
            _id,
            email,
            name,
            role,
            permissions: permissions.permissions || []
        };
    }
}