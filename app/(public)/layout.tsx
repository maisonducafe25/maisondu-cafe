import React, { ReactNode } from 'react'
import Navbar from './_components/navbar'

export default function PublicLayout({children} : {
  children: ReactNode
}) {
  return (
    <>
      {/* <Navbar /> */}
      {children}
    </>
  )
}
