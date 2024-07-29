import { JobDocument } from './schemas/job.schema';
import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'src/jobs/schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {

  constructor(@InjectModel(Job.name) private jobsModel: SoftDeleteModel<JobDocument>) { }


  async create(createJobDto: CreateJobDto, user: IUser) {
    return await this.jobsModel.create({
      ...createJobDto,
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

    const totalItems = (await this.jobsModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobsModel.find(filter)
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
      return "Jobs not found"
    }
    return await this.jobsModel.findOne({ _id: id })
  }


  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Jobs not found"
    }
    return await this.jobsModel.updateOne({ _id: id }, {
      ...updateJobDto,
      updatedBy: {
        _id: user._id,
        name: user.name
      }
    })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Jobs not found"
    }
    await this.jobsModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, name: user.name } })
    return await this.jobsModel.softDelete({ _id: id })
  }
}
