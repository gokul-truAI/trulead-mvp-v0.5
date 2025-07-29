'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bot, User, Shield } from 'lucide-react';

const UserNavLinks = () => (
    <>
        <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
            <Link href="/leads">My Leads</Link>
        </Button>
        <Button variant="ghost" asChild>
            <Link href="/request">Request Leads</Link>
        </Button>
    </>
);

const AdminNavLinks = () => (
    <>
        <Button variant="ghost" asChild>
            <Link href="/admin">Admin Dashboard</Link>
        </Button>
    </>
);


export default function Header() {
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('truLeadAiUserRole');
    if (storedRole === 'user' || storedRole === 'admin') {
      setRole(storedRole);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('truLeadAiUserRole');
    setRole(null);
    router.push('/');
  }

  const NavLinks = role === 'admin' ? AdminNavLinks : UserNavLinks;

  return (
    <header className="border-b border-primary/10 bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={role === 'admin' ? '/admin' : '/leads'} className="text-2xl font-bold text-primary flex items-center gap-2">
          TruLead<span className="text-accent">AI</span>
        </Link>
        
        {role && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>
            
            <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span className="capitalize">{role}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>
                                <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                                  TruLead<span className="text-accent">AI</span>
                                </Link>
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-4 mt-8">
                            <NavLinks />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                                {role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                <span className="capitalize">{role}</span>
                            </div>
                            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
