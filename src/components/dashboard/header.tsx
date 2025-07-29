import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-primary/10 bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          TruLead<span className="text-accent">AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">My Leads</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/request">Request Leads</Link>
          </Button>
        </nav>
        <Button variant="outline">Sign In</Button>
      </div>
    </header>
  );
}
