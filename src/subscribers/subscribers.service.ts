import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {

  constructor(@InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) { }

  async create({ email, name, skills }: CreateSubscriberDto, user: IUser) {
    const isExist = await this.subscriberModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã được đăng ký nhận thông báo`)
    }

    return await this.subscriberModel.create({
      email, name, skills,
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

    const totalItems = (await this.subscriberModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
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
      throw new BadRequestException("Đăng ký không tồn tại")
    }
    return await this.subscriberModel.findOne({ _id: id })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return await this.subscriberModel.updateOne({ email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          name: user.name
        }
      },
      { upsert: true }//Nếu tồn tại thì update không thi thêm mới
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Đăng ký không tồn tại")
    }
    await this.subscriberModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          name: user.name
        }
      }
    )

    return await this.subscriberModel.softDelete({ _id: id })
  }

  async getSkills(user: IUser) {
    const { email } = user
    return await this.subscriberModel.findOne({ email: email }, { skills: 1 })
  }

}
