import prisma from "@/lib/prisma"

export const baseline = async () => {

  await prisma.testMe.create({
    data: {
      name: 'Hello'
    }
  })
}