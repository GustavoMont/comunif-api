import { Injectable } from '@nestjs/common';
import { IEvasionReportRepository } from './interfaces/IEvasionReportRepository';
import { PrismaClient, EvasionReport as CreateData } from '@prisma/client';
import { EvasionReport } from 'src/models/EvasionReport';
import { EvasionReportFiltersDto } from './dto/evasion-report-filters.dto';

@Injectable()
export class EvasionReportRepository implements IEvasionReportRepository {
  constructor(private readonly db: PrismaClient) {}
  async delete(id: number): Promise<void> {
    await this.db.evasionReport.delete({ where: { id } });
  }
  async count({
    community,
    user,
  }: EvasionReportFiltersDto = {}): Promise<number> {
    return await this.db.evasionReport.count({
      where: { userId: user, communityId: community },
    });
  }
  async findMany(
    skip: number,
    take: number,
    { community, user }: EvasionReportFiltersDto,
  ): Promise<EvasionReport[]> {
    return await this.db.evasionReport.findMany({
      include: this.defaultInclude(),
      where: { communityId: community, userId: user },
      skip,
      take,
    });
  }
  defaultInclude() {
    return {
      community: { include: { communityChannels: true } },
      user: true,
      remover: true,
    };
  }
  async findById(id: number): Promise<EvasionReport> {
    return await this.db.evasionReport.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
  }
  async create(data: CreateData): Promise<EvasionReport> {
    return await this.db.evasionReport.create({
      data,
      include: this.defaultInclude(),
    });
  }
}
