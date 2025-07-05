import { PaginationDto } from '@/common/dto/page.dto';
import { MentorStatus, UserRole } from '@/common/enum/status.enum';
import { Mentors, Users } from '@/entities';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproveOrRejectMentorDto } from './dto/approve.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}
  // 멘토 신청 목록 조회
  async getMentorList({ page = 1, limit = 10 }: PaginationDto) {
    try {
      const queryBuilder = this.mentorRepository
      .createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .select([
          'mentor.id',
          'mentor.expertise',
          'user.email',
          'user.name',
          'mentor.status',
          'mentor.createdAt',
        ])
        .orderBy('mentor.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      const [result, total] = await queryBuilder.getManyAndCount();
      const data = result.map((mentor) => ({
        id: mentor.id,
        expertise: mentor.expertise,
        status: mentor.status,
        createdAt: mentor.createdAt,
        email: mentor.user.email,
        name: mentor.user.name,
      }));


      return {
        data,
        total,
        totalPage: Math.ceil(total / limit),
        message: '멘토신청  목록을 조회했습니다.',
      };

    } catch (error) {
      throw new InternalServerErrorException(
        '멘토 신청 정보를 찾을 수 없습니다.',
      );
    }
  }
  // 멘토 상세 조회
  async getMentorDetail(id:string) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { id },
        relations: ['user']
      })
      return {
        id: mentor.id,
        expertise:mentor.expertise,
        email:mentor.user.email,
        name:mentor.user.name,
        status:mentor.status,
        createdAt:mentor.createdAt,
        company:mentor.company,
        introduce:mentor.introduce,
        position:mentor.position,
        career:mentor.career,
        portfolio:mentor.portfolio,
        image:mentor.user.image,
        phone:mentor.user.phone
      }
    } catch (error) {
      throw new InternalServerErrorException(
        '멘토 상세 정보를 불러오는 데 실패했습니다.',
      );
    }
  }
  // 유저 목록 조회
  async getUserList({ page = 1, limit = 10 }: PaginationDto) {
     try {
      const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
          'user.id',
          'user.email',
          'user.nickname',
          'user.name',
          'user.role',
          'user.createdAt',
        ])
        .orderBy('user.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      const [result, total] = await queryBuilder.getManyAndCount();
      const data = result.map((user) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }));


      return {
        data,
        totalPage: Math.ceil(total / limit),
        message: '사용자 목록을 조회했습니다.',
      };

    } catch (error) {
      throw new InternalServerErrorException(
        '사용자 목록 를 찾을 수 없습니다.',
      );
    }
  }
  // 승인 / 거절
  async approveMentor (mentorId :string, userId:string,body:ApproveOrRejectMentorDto) {
    const admin = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!admin) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (admin.role !== UserRole.ADMIN)
      throw new ForbiddenException('관리자만 이 작업을 수행할 수 있습니다.');
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });
    if (!mentor) throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
    if (body.status === MentorStatus.REJECTED && !body.reason) {
      throw new BadRequestException('거절 사유를 입력해야 합니다.');
    }
    mentor.status = body.status;
    mentor.reason = body.reason || null;
    if (body.status === MentorStatus.REJECTED) {
      mentor.rejectedAt = new Date();
    } else {
      mentor.rejectedAt = null;
      mentor.reason = null;
    }
    try {
      
      await this.mentorRepository.save(mentor);
      if(body.status === MentorStatus.REJECTED) {
        return {
          message: '멘토가 거절되었습니다.',
        }
      }
      return {
        message: '멘토가 승인되었습니다.',
      };

    } catch (error) {
      throw new InternalServerErrorException(
        '멘토 승인/거절 처리 중 오류가 발생했습니다.',
      );
    }
  }
}
