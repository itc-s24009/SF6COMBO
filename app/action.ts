"use server"

import prisma from "../app/lib/prisma";
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCombo(formData: FormData) {
  const moves = formData.get("moves") as string
  const endFrame = formData.get("endFrame") ? Number(formData.get("endFrame")) : null
  const damage = formData.get("damage") ? Number(formData.get("damage")) : null
  const remarks = formData.get("remarks") as string
  const tagsString = formData.get("tags") as string 

  // タグ文字列("壁コンボ,立ち回り"等)を分解して配列化
  const tags = tagsString 
    ? tagsString.split(',').map(t => t.trim()).filter(t => t !== "") 
    :[];

  // DBに新しいコンボを保存（新しいタグは自動で作る、あるタグは連携）
  await prisma.combo.create({
    data: {
      moves, endFrame, damage, remarks,
      tags: {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      }
    }
  });

  // ホーム画面のデータを最新化して、ホーム画面に戻る
  revalidatePath("/");
  redirect("/");
}
// ------ (既存の createCombo の下に追加) ------

// 更新機能
export async function updateCombo(formData: FormData) {
  const id = formData.get("id") as string
  const moves = formData.get("moves") as string
  const endFrame = formData.get("endFrame") ? Number(formData.get("endFrame")) : null
  const damage = formData.get("damage") ? Number(formData.get("damage")) : null
  const remarks = formData.get("remarks") as string
  const tagsString = formData.get("tags") as string 

  // タグ処理（createと同じロジック）
  const tags = tagsString 
    ? tagsString.split(',').map(t => t.trim()).filter(t => t !== "") 
    : [];

  // 一旦既存のタグ関係を解除して、新しいタグを付け直すのが安全な更新方法
  await prisma.combo.update({
    where: { id },
    data: {
      moves, endFrame, damage, remarks,
      tags: {
        set: [], // まずリセット
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      }
    }
  });

  revalidatePath("/");
  redirect("/");
}

// 削除機能
export async function deleteCombo(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.combo.delete({
    where: { id }
  });
  revalidatePath("/");
}