import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

export const baseline = async () => {

  const roleCashier = await prisma.role.upsert({
    where: {
      name: 'Cashier'
    },
    create:{
      name: 'Cashier'
    },
    update: {}
  })
  const roleManager = await prisma.role.upsert({
    where: {
      name: 'Manager'
    },
    create:{
      name: 'Manager'
    },
    update: {}
  })
  const roleAdmin = await prisma.role.upsert({
    where: {
      name: 'Admin'
    },
    create:{
      name: 'Admin'
    },
    update: {}
  })
  
  console.log("Roles Seeded")

  const defaultPassword = await hash('password1234', 12)

  const userIvy = await prisma.user.upsert({
    where: {
      email: 'admin@maisonducafe.com'
    },
    create: {
      email: 'admin@maisonducafe.com',
      password_hash: defaultPassword,
      profile: {
        create: {
          company_id: 'EMP001',
          first_name: 'Ivy',
          last_name: 'Solidarios',
          userRoles: {
            create: {
              role_id: roleAdmin?.id!
            }
          }
        }
      }
    },  
    update: {}
  })
  const userJoshua = await prisma.user.upsert({
    where: {
      email: 'cashier@maisonducafe.com'
    },
    create: {
      email: 'cashier@maisonducafe.com',
      password_hash: defaultPassword,
      profile: {
        create: {
          company_id: 'EMP002',
          first_name: 'Joshua',
          last_name: 'Gonzales',
          userRoles: {
            create: {
              role_id: roleCashier?.id!
            }
          }
        }
      }
    },  
    update: {}
  })
  const userJohn = await prisma.user.upsert({
    where: {
      email: 'manager@maisonducafe.com'
    },
    create: {
      email: 'manager@maisonducafe.com',
      password_hash: defaultPassword,
      profile: {
        create: {
          company_id: 'EMP003',
          first_name: 'John',
          last_name: 'Doe',
          userRoles: {
            create: {
              role_id: roleManager?.id!
            }
          }
        }
      }
    },  
    update: {}
  })

  console.log('Users Seeded')
}