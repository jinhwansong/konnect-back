// import { ApiProperty } from "@nestjs/swagger";
// import { IsEmpty, IsString } from "class-validator";
// import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { Users } from "./user.entity";
// import { Like } from "./like.entity";
// import { Comment } from "./comment.entity";

// @Entity({ schema: 'konnect', name: 'articles' })
// export class Article {
//   @ApiProperty({
//     example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
//     description: '아티클 UUID',
//     required: true,
//   })
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//   @IsString()
//   @IsEmpty()
//   @ApiProperty({
//     example: 'React로 웹 개발하기',
//     description: '아티클 제목',
//     required: true,
//   })
//   @Column({ type: 'varchar', length: 255, nullable: false })
//   title: string;
//   @IsString()
//   @IsEmpty()
//   @ApiProperty({
//     example: 'React로 웹 개발하기',
//     description: '아티클 내용',
//     required: true,
//   })
//   @Column({ type: 'varchar', nullable: false })
//   content: string;
//   @ApiProperty({
//     example: '2023-05-09T12:34:56Z',
//     description: '아티클 등록일',
//     required: false,
//   })
//   @CreateDateColumn()
//   createdAt: Date;

//   @ApiProperty({
//     example: '2023-05-09T12:34:56Z',
//     description: '아티클 수정일',
//     required: false,
//   })
//   @UpdateDateColumn()
//   updatedAt: Date;
//   @ApiProperty({ description: '작성자', required: true })
//   @ManyToOne(() => Users, (user) => user.id, {
//     onDelete: 'CASCADE',
//   })
//   author: Users;
//   @ApiProperty({ example: 0, description: '조회수', required: true })
//   @Column({ type: 'int', default: 0 })
//   views: number;

//   @OneToMany(() => Like, (like) => like.article)
//   likes: Like[];

//   @OneToMany(() => Comment, (comment) => comment.article)
//   comments: Comment[];
// }