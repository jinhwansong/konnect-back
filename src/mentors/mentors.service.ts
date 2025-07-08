import { MentoringSession, Mentors, Users } from '@/entities';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentorDto } from './dto/mentor.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Users) 
    private readonly userRepository: Repository<Users>,
    @InjectRepository(MentoringSession) 
    private readonly sessionRepository: Repository<MentoringSession>,
  ) {}

  // 멘토 신청
  async apply(userId: string, body: CreateMentorDto) {
    try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['mentorProfile'],
        });
        if(!user) {
            throw new NotFoundException('유저를 찾을 수 없습니다.');
        }
        if (user.mentorProfile) {
            throw new ConflictException('이미 멘토 신청이 되어있습니다.');
        }
        const mentor = this.mentorRepository.create({ ...body, user });
        await this.mentorRepository.save(mentor)
        return {message:'멘토 신청이 완료되었습니다.'}
    } catch (error) {
        throw new InternalServerErrorException(
        '멘토 신청 중 오류가 발생했습니다.',
      );
    }
  }
  async updatePublicStatus (userId: string, isPublic:boolean) {
    const mentor = await this.mentorRepository.findOne({
      where: { user: {id:userId}},
      relations: ['user'],
    })
    if (!mentor) {
      throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
    }
    for (const session of mentor.sessions) {
      session.isPublic = isPublic;
    }
    await this.sessionRepository.save(mentor.sessions)
    return {
      message: `멘토의 모든 세션이 ${isPublic ? '공개' : '비공개'} 처리되었습니다.`,
    };
  }
}
