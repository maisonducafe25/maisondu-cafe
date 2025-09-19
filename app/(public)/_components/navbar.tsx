"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Navbar() {
	const pathname = usePathname();

	const links = [
		{
			label: "About",
			href: "/",
			isActive: pathname === "/",
		},
		{
			label: "Menu",
			href: "/",
			isActive: pathname === "/",
		},
		{
			label: "Location",
			href: "/",
			isActive: pathname === "/",
		},
	];
	return <header>
   
    <nav>
      <ul>
        {links.map((link, index) => {
          const {href, isActive, label} = link;

          return (
            <li key={index}>
              <Button variant={'link'} className={cn(
                isActive ? 'border-b' : ''
              )} asChild>
                <Link href={href}>
                  {label}
                </Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  </header>;
}
