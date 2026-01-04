import { NextResponse } from "next/server";
import { deleteAllRecipes } from "@/lib/db/recipes";

export async function DELETE() {
  try {
    const deletedCount = await deleteAllRecipes();
    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      message: `נמחקו ${deletedCount} מתכונים`,
    });
  } catch (error) {
    console.error("Error deleting all recipes:", error);
    return NextResponse.json(
      { error: "Failed to delete recipes" },
      { status: 500 }
    );
  }
}
