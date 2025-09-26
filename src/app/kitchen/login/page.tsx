
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios-instance';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `/api/login`,
        {
          email,
          password,
        }
      );

      if (response.status === 200 && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        router.push('/kitchen');
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };
  
  const isFormInvalid = !email.trim() || !password.trim();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline text-cyan-400">
            Vendor Login
          </CardTitle>
          <CardDescription>
            Access your kitchen dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            {error && <p className="text-sm text-center text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white"
              type="submit"
              disabled={loading || isFormInvalid}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Login'
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/kitchen/register" className="underline underline-offset-2 text-cyan-400">
                    Register
                </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
