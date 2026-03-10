import prisma from "../../../lib/prisma";
import TipsForm from "../../../components/TipsForm";
import { notFound } from "next/navigation";

export default async function EditTipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // DBから編集対象のデータを取得。関連するキャラクターも一緒に持ってくる
  const tip = await prisma.strategyTip.findUnique({
    where: { id },
    include: { characters: true }
  });

  if (!tip) {
    notFound(); // データがなければ404ページへ
  }

  return <TipsForm initialData={tip} />;
}