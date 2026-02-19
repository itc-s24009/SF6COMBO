import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // カッコの中身を空にします。これで型エラーは絶対に出ません！
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma