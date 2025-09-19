import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { modulePermissions } from "./lib/constants"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.redirect(new URL("/login", req.url))

  const pathname = req.nextUrl.pathname

  for (const [modulePath, allowedDeptEmails] of Object.entries(modulePermissions)) {
    if (pathname.startsWith(modulePath)) {
      if (allowedDeptEmails.includes(token.email)) {
        return NextResponse.next()
      }

      if (allowedDeptEmails.includes(token.department_email as string)) {
        return NextResponse.next()
      }
      

      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
	matcher: [
		"/admin/dashboard/:path*",
		"/admin/inventory/:path*",
		"/admin/sales/:path*",
		"/admin/user-accounts/:path*",
	],
};