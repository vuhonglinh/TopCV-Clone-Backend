import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(Job.name) private jobsModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  @Get()
  @Public()
  @Cron("0 10 0 * * 0")//0.00am mỗi chủ nhật
  @ResponseMessage("Test email")
  async handleTestEmail() {
    let jobs = [];
    const subscribers = await this.subscriberModel.find()
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobsModel.find({ skills: { $in: subsSkills } })
      if (jobWithMatchingSkills.length > 0) {
        jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
            skills: item.skills
          }
        })
      }

      await this.mailerService.sendMail({
        to: "vulinh18072k1@gmail.com",
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Nice App! Confirm your Email',
        template: 'new-job', // template
        context: {
          reciver: subs.name,
          jobs: jobs
        }
      });
    }
  }

}
