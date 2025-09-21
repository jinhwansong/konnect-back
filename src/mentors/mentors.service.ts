import {  Mentors, Users } from '@/entities';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMentorDto } from './dto/mentor.dto';
import {
  UpdateCareerDto,
  UpdateCompanyDto,
  UpdateCompanyHiddenDto,
  UpdateExpertiseDto,
  UpdatePositionDto,
} from './dto/update.dto';

@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);

  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    private readonly dataSource: DataSource,
  ) {}

  // 멘토 신청
  async apply(userId: string, body: CreateMentorDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const user = await manager.findOne(Users, {
          where: { id: userId },
          relations: ['mentorProfile'],
        });
        if (!user) {
          throw new NotFoundException('유저를 찾을 수 없습니다.');
        }
        if (user.mentorProfile) {
          throw new ConflictException('이미 멘토 신청이 되어있습니다.');
        }
        
        const mentor = manager.create(Mentors, { ...body, user });
        await manager.save(Mentors, mentor);
        
        this.logger.log(`Mentor application submitted by user ${userId}`);
        return { message: '멘토 신청이 완료되었습니다.' };
      } catch (error) {
        this.logger.error(`Failed to apply mentor for user ${userId}: ${error.message}`);
        throw error instanceof NotFoundException || error instanceof ConflictException
          ? error
          : new InternalServerErrorException('멘토 신청 중 오류가 발생했습니다.');
      }
    });
  }

  // 회사명 공개 여부 설정
  async updatePublicCompanyName(id: string, body: UpdateCompanyHiddenDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
      });
      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }
      
      mentor.isCompanyHidden = body.isCompanyHidden;
      await this.mentorRepository.save(mentor);

      this.logger.log(`Company visibility updated for mentor ${id}: ${body.isCompanyHidden}`);
      return { message: '공개 여부가 수정되었습니다.' };
    } catch (error) {
      this.logger.error(`Failed to update company visibility for mentor ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('회사명 공개 여부 설정 중 오류가 발생했습니다.');
    }
  }
  // 연차 변경
  async updateCareer(id: string, body: UpdateCareerDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
      });
      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }
      
      mentor.career = body.career;
      await this.mentorRepository.save(mentor);

      this.logger.log(`Career updated for mentor ${id}: ${body.career}`);
      return { career: mentor.career };
    } catch (error) {
      this.logger.error(`Failed to update career for mentor ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('연차 변경 중 오류가 발생했습니다.');
    }
  }
  // 직책 변경
  async updatePosition(id: string, body: UpdatePositionDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
      });
      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }
      
      mentor.position = body.position;
      await this.mentorRepository.save(mentor);

      this.logger.log(`Position updated for mentor ${id}: ${body.position}`);
      return { position: mentor.position };
    } catch (error) {
      this.logger.error(`Failed to update position for mentor ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('직책 변경 중 오류가 발생했습니다.');
    }
  }

  // 전문 분야 변경
  async updateExpertise(id: string, body: UpdateExpertiseDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
      });
      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }
      
      mentor.expertise = body.expertise;
      await this.mentorRepository.save(mentor);

      this.logger.log(`Expertise updated for mentor ${id}: ${body.expertise}`);
      return { expertise: mentor.expertise };
    } catch (error) {
      this.logger.error(`Failed to update expertise for mentor ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('전문 분야 변경 중 오류가 발생했습니다.');
    }
  }

  // 회사명 변경
  async updateCompany(id: string, body: UpdateCompanyDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
      });
      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }
      
      mentor.company = body.company;
      await this.mentorRepository.save(mentor);

      this.logger.log(`Company updated for mentor ${id}: ${body.company}`);
      return { company: mentor.company };
    } catch (error) {
      this.logger.error(`Failed to update company for mentor ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('회사명 변경 중 오류가 발생했습니다.');
    }
  }

  // 프로필 조회
  async mentorProfile(id: string) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id } },
        relations: ['user'],
      });
      if (!mentor) {
        throw new NotFoundException('해당 유저의 멘토 정보를 찾을 수 없습니다.');
      }
      
      this.logger.log(`Mentor profile retrieved for user ${id}`);
      return {
        message: '멘토 정보 입니다.',
        career: mentor.career,
        company: mentor.company,
        expertise: mentor.expertise,
        isCompanyHidden: mentor.isCompanyHidden,
        position: mentor.position,
      };
    } catch (error) {
      this.logger.error(`Failed to get mentor profile for user ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('멘토 정보 조회 중 오류가 발생했습니다.');
    }
  }
}
