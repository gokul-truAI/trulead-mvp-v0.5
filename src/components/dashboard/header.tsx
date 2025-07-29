import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bot } from 'lucide-react';

const NavLinks = () => (
    <>
        <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
            <Link href="/">My Leads</Link>
        </Button>
        <Button variant="ghost" asChild>
            <Link href="/request">Request Leads</Link>
        </Button>
    </>
);

export default function Header() {
  return (
    <header className="border-b border-primary/10 bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          TruLead<span className="text-accent">AI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
        </nav>
        
        <div className="hidden md:flex">
            <Button variant="outline">Sign In</Button>
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
                        <Button variant="outline">Sign In</Button>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
