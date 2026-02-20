export const dynamic = "force-dynamic";

import prisma from "../../lib/prisma";
import EditForm from "./EditForm";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const combo = await prisma.combo.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!combo) return notFound();

  // ①ここで、削除されて今はもうどこにも使われていない不要タグを除外して渡す！
  const allTags = await prisma.tag.findMany({
    where: {
      combos: { some: {} } // 使われている実績が1個以上あるタグだけ取得
    },
    orderBy: { name: 'asc' } // あいうえお順で綺麗に表示するおまけ
  });

  return <EditForm combo={combo} allTags={allTags} />;
}