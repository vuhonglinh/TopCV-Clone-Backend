import { compareSync } from 'bcryptjs';
import { PermissionDocument, PermissionSchema } from './../permissions/schemas/permission.schema';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission } from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from 'src/databases/sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);
    constructor(
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        @InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>,
        @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
        private configService: ConfigService,
        private usersService: UsersService
    ) {

    }

    async onModuleInit() {
        const isInit = this.configService.get<string>("SHOULD_INIT")
        if (Boolean(isInit)) {
            const countUser = await this.userModel.countDocuments()
            const countPermission = await this.permissionModel.countDocuments()
            const countRole = await this.roleModel.countDocuments()

            if (countPermission == 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS)
            }

            if (countRole == 0) {
                const permissions = await this.permissionModel.find().select("_id")
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: "Administrator",
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        name: USER_ROLE,
                        description: "Client",
                        isActive: true,
                        permissions: []
                    },
                ])
            }

            if (countUser == 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE })
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                const password = this.configService.get<string>("INIT_PASSWORD")
                console.log(adminRole)
                await this.userModel.insertMany([
                    {
                        name: "Administrator",
                        email: "admin@gmail.com",
                        password: this.usersService.getHashPassword(password),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: adminRole?.id
                    },
                    {
                        name: "Vũ Hồng Lĩnh",
                        email: "vulinh18072k1@gmail.com",
                        password: this.usersService.getHashPassword(password),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: adminRole?.id
                    },
                    {
                        name: "Vũ Văn Hiển",
                        email: "hien@gmail.com",
                        password: this.usersService.getHashPassword(password),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: userRole?.id
                    }
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log(">>>>> DATA READLY")
            }
        }
    }
}
