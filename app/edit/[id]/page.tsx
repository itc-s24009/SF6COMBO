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

  // 追加：ここですべての既存タグを取得して、EditForm に渡す！
  const allTags = await prisma.tag.findMany();

  return <EditForm combo={combo} allTags={allTags} />;
}