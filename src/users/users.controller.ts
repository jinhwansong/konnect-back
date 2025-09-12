import { UserDto } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateImageDto,
  UpdateNicknameDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
} from './dto/update.user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '@/common/util/multer.options';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: '회원정보' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 입니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Get('')
  async profile(@User('id') user: string) {
    return this.userService.profile(user);
  }

  @ApiOperation({ summary: '휴대폰 번호 변경' })
  @ApiResponse({
    status: 200,
    description: '휴대폰 번호가 변경되었습니다.',
    type: UpdatePhoneDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (형식 오류, 인증 실패 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('phone')
  async updatePhone(@User('id') userId: string, @Body() body: UpdatePhoneDto) {
    return this.userService.updatePhone(userId, body);
  }

  @ApiOperation({ summary: '닉네임 변경' })
  @ApiResponse({
    status: 200,
    description: '닉네임이 변경되었습니다.',
    type: UpdateNicknameDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (형식 오류, 인증 실패 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('nickname')
  async updateNickname(
    @User('id') userId: string,
    @Body() body: UpdateNicknameDto,
  ) {
    return this.userService.updateNickname(userId, body);
  }
  @ApiOperation({ summary: '프로필 이미지 변경' })
  @ApiResponse({
    status: 200,
    description: '프로필 이미지가 변경되었습니다.',
    type: UpdateImageDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 누락, 형식 오류 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', createMulterOptions('uploads/profile')),
  )
  @Patch('profile')
  async uploadArticleEditorImages(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateProfileImage(userId, file);
  }

  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 변경되었습니다.',
    schema: { example: { message: '비밀번호가 변경되었습니다.' } },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (형식 오류, 현재 비밀번호 불일치 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('password')
  async updatePassword(
    @User('id') userId: string,
    @Body() body: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, body);
  }

  @ApiOperation({ summary: '회원 탈퇴 (소프트 삭제)' })
  @ApiResponse({
    status: 200,
    description: '계정이 탈퇴 처리되었습니다.',
    schema: { example: { message: '계정이 탈퇴 처리되었습니다.' } },
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Delete('me')
  async deleteAccount(@User('id') userId: string) {
    return this.userService.deleteAccount(userId);
  }
}
