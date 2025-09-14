import { MentoringSession, Mentors, Users } from '@/entities';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  // 멘토 신청
  async apply(userId: string, body: CreateMentorDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['mentorProfile'],
      });
      if (!user) {
        throw new NotFoundException('유저를 찾을 수 없습니다.');
      }
      if (user.mentorProfile) {
        throw new ConflictException('이미 멘토 신청이 되어있습니다.');
      }
      const mentor = this.mentorRepository.create({ ...body, user });
      await this.mentorRepository.save(mentor);
      return { message: '멘토 신청이 완료되었습니다.' };
    } catch (error) {
      throw new InternalServerErrorException(
        '멘토 신청 중 오류가 발생했습니다.',
      );
    }
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

      return { message: '공개 여부가 수정되었습니다.' };
    } catch (error) {
      throw new InternalServerErrorException(
        `회사명 공개 여부 설정 중 오류가 발생했습니다: ${error.message}`,
      );
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

      return { career: mentor.career };
    } catch (error) {
      throw new InternalServerErrorException(
        `연차 변경 중 오류가 발생했습니다: ${error.message}`,
      );
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

      return { position: mentor.position };
    } catch (error) {
      throw new InternalServerErrorException(
        `직책 변경 중 오류가 발생했습니다: ${error.message}`,
      );
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

      return { expertise: mentor.expertise };
    } catch (error) {
      throw new InternalServerErrorException(
        `전문 분야 중 오류가 발생했습니다: ${error.message}`,
      );
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

      return { company: mentor.company };
    } catch (error) {
      throw new InternalServerErrorException(
        `회사명 변경 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 프로필 조회
  async mentorProfile(id: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });
    if (!mentor) {
      throw new NotFoundException('해당 유저의 멘토 정보를 찾을 수 없습니다.');
    }
    return {
      message: '멘토 정보 입니다.',
      career: mentor.career,
      company: mentor.company,
      expertise: mentor.expertise,
      isCompanyHidden: mentor.isCompanyHidden,
      position: mentor.position,
    };
  }
}
