import { IUser } from './../users/users.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {

  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }


  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const isExist = await this.permissionModel.findOne({ apiPath: createPermissionDto.apiPath, method: createPermissionDto.method })
    if (isExist) {
      throw new BadRequestException(`Permission với apiPath=${createPermissionDto.apiPath} và method=${createPermissionDto.method} đã tồn tại`)
    }

    return await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        name: user.name
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.permissionModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
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
      throw new BadRequestException("Permission not found");
    }
    return await this.permissionModel.findOne({ _id: id });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Permission not found");
    }
    
    const isExist = await this.permissionModel.findOne({
      apiPath: updatePermissionDto.apiPath,
      method: updatePermissionDto.method,
      _id: { $ne: id }
    });

    if (isExist) {
      throw new BadRequestException(`Permission với apiPath=${updatePermissionDto.apiPath} và method=${updatePermissionDto.method} đã tồn tại`);
    }

    return await this.permissionModel.updateOne({ _id: id }, { ...updatePermissionDto, updatedBy: { _id: user._id, name: user.name } });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Permission not found");
    }
    await this.permissionModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, name: user.name } });
    return await this.permissionModel.softDelete({ _id: id });
  }
}
