'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'user' | 'admin') => {
    localStorage.setItem('truLeadAiUserRole', role);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/leads');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
         <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          TruLead<span className="text-accent">AI</span>
        </h1>
        <p className="text-muted-foreground mt-2">Welcome! Please select your role to continue.</p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Choose your access level to proceed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleLogin('user')}
            className="w-full"
            size="lg"
          >
            <User className="mr-2 h-5 w-5" />
            Login as User
          </Button>
          <Button
            onClick={() => handleLogin('admin')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5" />
            Login as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
