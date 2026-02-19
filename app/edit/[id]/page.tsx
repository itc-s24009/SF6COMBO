import prisma from "../../lib/prisma";
import EditForm from "./EditForm"; // 後で作る部品

export default async function EditPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // URLのIDを使ってデータを取得
  const combo = await prisma.combo.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!combo) return <div>データが見つかりません</div>;

  return <EditForm combo={combo} />;
}