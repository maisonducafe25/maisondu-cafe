import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
      return NextResponse.json({
        message:'Internal Server Error',
        error,
      }, { status: 500 })
    }
}