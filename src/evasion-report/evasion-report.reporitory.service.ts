import { Injectable } from '@nestjs/common';
import { IEvasionReportRepository } from './interfaces/IEvasionReportRepository';
import { PrismaClient, EvasionReport as CreateData } from '@prisma/client';
import { EvasionReport } from 'src/models/EvasionReport';

@Injectable()
export class EvasionReportRepository implements IEvasionReportRepository {
  constructor(private readonly db: PrismaClient) {}
  async create(data: CreateData): Promise<EvasionReport> {
    return await this.db.evasionReport.create({
      data,
      include: {
        community: { include: { communityChannels: true } },
        user: true,
        remover: true,
      },
    });
  }
}
