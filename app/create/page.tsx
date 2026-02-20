import prisma from "../lib/prisma";
import CreateForm from "./CreateForm";

export default async function CreatePage() {
  // DBから、すべての既存タグを取得
  const allTags = await prisma.tag.findMany();
  
  return <CreateForm allTags={allTags} />;
}