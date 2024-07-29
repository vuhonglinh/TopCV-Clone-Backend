import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {

  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }


  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const isExist = await this.roleModel.findOne({
      name: createRoleDto.name
    });
    if (isExist) {
      throw new BadRequestException(`Role ${createRoleDto.name} đã tồn tại`);
    }
    return await this.roleModel.create({ ...createRoleDto, createdBy: { _id: user._id, name: user.name } })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.roleModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
      throw new BadRequestException("Role không tồn tại");
    }
    return await this.roleModel.findById(id)
      .populate({ path: 'permissions', select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Role không tồn tại");
    }
    const isExist = await this.roleModel.findOne({
      name: updateRoleDto.name,
      _id: {
        $ne: id
      }
    });
    if (isExist) {
      throw new BadRequestException(`Role ${updateRoleDto.name} đã tồn tại`);
    }
    return await this.roleModel.updateOne({ _id: id }, { ...updateRoleDto, updatedBy: { _id: user._id.replace, name: user.name } });
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === "ADMIN") {
      throw new BadRequestException("Không thể xóa Role ADMIN");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Role không tồn tại");
    }
    await this.roleModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, name: user.name } })
    return await this.roleModel.softDelete({ _id: id })
  }
}
