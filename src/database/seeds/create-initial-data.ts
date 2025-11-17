import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserRole } from '@/common/enum/status.enum';
import { Users } from '@/entities';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // 랜덤데이터 만들때 사용
  ): Promise<any> {
    const userRepository = await dataSource.getRepository(Users);
    
    // 기존 관리자 계정 확인
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@naver.com' },
    });

    // 관리자 계정이 이미 존재하면 seed하지 않음
    if (existingAdmin) {
      console.log('✅ 관리자 계정이 이미 존재합니다. Seed를 건너뜁니다.');
      return;
    }

    // 관리자 계정이 없을 때만 생성
    const password = await bcrypt.hash('admin123!#', 12);
    await userRepository.insert([
      {
        email: 'admin@naver.com',
        password: password,
        name: '관리자',
        nickname: '관리자',
        phone: '01012345678',
        role: UserRole.ADMIN,
      },
    ]);
    console.log('✅ 관리자 계정이 생성되었습니다.');
  }
}
