export const dynamic = "force-dynamic";

import prisma from "../lib/prisma"; // データベースアクセス用のPrismaクライアント
import ClientCreateForm from "./ClientCreateForm"; // 後述する実際の表示用ファイル

export default async function CreatePage() {
  // ①「紐づいているコンボが1つ以上ある」実存するタグだけを取得
  const allTags = await prisma.tag.findMany({
    where: {
      combos: { some: {} }
    },
    orderBy: { name: 'asc' }
  });
  
  return <ClientCreateForm allTags={allTags} />;
}