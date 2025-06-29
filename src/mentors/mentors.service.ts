import { Mentors, Users } from '@/entities';
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
  ) {}

  // 멘토 신청
  async apply(userId: string, dto: CreateMentorDto) {
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
        const mentor = this.mentorRepository.create({ ...dto, user });
        await this.mentorRepository.save(mentor)
        return {message:'멘토 신청이 완료되었습니다.'}
    } catch (error) {
        throw new InternalServerErrorException(error.message);
    }
  }
}
