import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { CreateUserEvasionReportDto } from './dto/create-user-evasion-report.dto';
import { IEvasionReportService } from './interfaces/IEvasionReportService';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('/api/evasion-report')
export class EvasionReportController {
  constructor(
    @Inject(IEvasionReportService)
    private readonly service: IEvasionReportService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async leftCommunity(
    @Body() body: CreateUserEvasionReportDto,
    @User() user: RequestUser,
  ) {
    return await this.service.createReportByUser(body, user);
  }
}
