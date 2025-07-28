import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-primary/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">
          TruLead<span className="text-accent">AI</span>
        </h1>
        <Button variant="outline">Sign In</Button>
      </div>
    </header>
  );
}
