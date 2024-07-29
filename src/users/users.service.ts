import { IsEmail } from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  getHashPassword = (palinPassword: string) => {
    const salt = genSaltSync(10)
    const hash = hashSync(palinPassword, salt)
    return hash;
  }

  async create({ name, email, address, age, company, gender, password, role }: CreateUserDto, user: IUser) {
    const isExits = await this.userModel.findOne({ email })
    if (isExits) {
      throw new BadRequestException("Email đã tồn tại")
    }
    const hashPassword = this.getHashPassword(password)

    return await this.userModel.create(
      {
        name, email, address, age, gender, password: hashPassword, role, company,
        createdBy: {
          _id: user._id,
          name: user.name
        }
      }
    )
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select("-password")//Bỏ qua trường password
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("User không tồn tại")
    }
    return await this.userModel.findOne({ _id: id })
      .select("-password")
      .populate({ path: 'role', select: { _id: 1, name: 1, permissions: 1 } })
  }

  async findOneByUsername(email: string) {
    return await this.userModel.findOne({ email })
      .populate({ path: 'role', select: { name: 1, _id: 1 } })
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);//Boolean
  }

  async update(updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(updateUserDto._id)) {
      throw new BadRequestException("User không tồn tại")
    }
    return await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto })
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("User không tồn tại")
    }

    const foundUser = await this.userModel.findById(id)

    if (foundUser &&  foundUser.email === 'admin@example.com') {
      throw new BadRequestException("User không thể xóa")
    }
    return await this.userModel.softDelete({ _id: id })
  }


  async register({ name, email, address, age, gender, password }: RegisterUserDto) {
    const isExits = await this.userModel.findOne({ email })
    if (isExits) {
      throw new BadRequestException("Email đã tồn tại")
    }
    const hashPassword = this.getHashPassword(password);
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    return await this.userModel.create({ name, email, address, age, gender, password: hashPassword, role: userRole._id })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken })
  }

  findTokenByToken = async (refreshToken: string) => {
    return await this.userModel.findOne<IUser>({ refreshToken })
      .populate({
        path: "role",
        select: { name: 1 }
      })
  }
}
