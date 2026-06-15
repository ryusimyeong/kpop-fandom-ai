/**
 * @file PrismaClient 싱글턴.
 *
 * [학습 메모] Next.js dev에서는 HMR로 모듈이 반복 평가되며 PrismaClient가 매번 새로 생성되어
 * DB 커넥션이 누수된다. globalThis에 캐싱해 프로세스당 1개만 유지한다(프로덕션 표준 패턴).
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
