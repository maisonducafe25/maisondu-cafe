import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hello = await prisma.testMe.findMany();
    return NextResponse.json({
      data: hello,
      message: 'Hello'
    })
  } catch (error) {
    return NextResponse.json({
      message:'Internal Server Error',
      error,
    }, { status: 500 })
  }
}