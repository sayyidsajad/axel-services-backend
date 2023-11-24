import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/repositories/base/user.repository';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private _userRepository: UserRepository,
    private readonly _mailerService: MailerService,
  ) {}
  @Cron(CronExpression.EVERY_WEEKEND, { name: 'subscription' })
  async handleCron() {
    const getAllMail = await this._userRepository.findAllUsers();
    for (const user of getAllMail) {
      await this._mailerService.sendMail({
        to: user,
        from: process.env.DEV_MAIL,
        subject: 'Axel Services Email Verification',
        text: 'Axel Services',
        html: `
          <table class="max-w-screen-md mx-auto p-10 bg-gray-100">
              <!-- Your HTML content here -->
          </table>
        `,
      });
    }
  }
}
