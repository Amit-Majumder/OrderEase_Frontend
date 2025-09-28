
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
import { axiosInstance } from '@/lib/axios-instance';

export default function LandingPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasskey, setRegisterPasskey] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await axiosInstance.post(`/api/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.status === 200 && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.userResponse) {
          localStorage.setItem(
            'userProfile',
            JSON.stringify(response.data.userResponse)
          );
        }
        router.push('/kitchen');
      } else {
        setLoginError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setLoginError(
        err.response?.data?.message || 'Invalid credentials or server error.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      const response = await axiosInstance.post(
        `/api/register`,
        {
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: 'owner',
          passkey: registerPasskey,
        }
      );

      if (response.status === 201) {
        // Automatically log the user in after successful registration
        const loginResponse = await axiosInstance.post(`/api/login`, {
            email: registerEmail,
            password: registerPassword,
        });
        if (loginResponse.status === 200 && loginResponse.data.token) {
            localStorage.setItem('authToken', loginResponse.data.token);
            if (loginResponse.data.userResponse) {
                localStorage.setItem(
                    'userProfile',
                    JSON.stringify(loginResponse.data.userResponse)
                );
            }
            router.push('/kitchen');
        } else {
            // If auto-login fails, show the login form with a success message
            setIsRegistering(false);
            setLoginError("Registration successful! Please log in.");
        }
      } else {
        setRegisterError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setRegisterError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setRegisterLoading(false);
    }
  };
  
  const handleRegisterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only English alphabets and spaces
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setRegisterName(value);
    }
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isLoginFormInvalid = !isValidEmail(loginEmail) || !loginPassword.trim();
  const isRegisterFormInvalid = !registerName.trim() || !isValidEmail(registerEmail) || registerPassword.length < 6 || !registerPasskey.trim();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow flex flex-col p-4">
        <div className="w-full max-w-4xl text-center pt-16 mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold font-headline text-cyan-400">
            Welcome to OrderEase
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            The simplest way to manage your food orders
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {isRegistering ? (
            <Card className="w-full max-w-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline text-cyan-400">
                  Register
                </CardTitle>
                <CardDescription>
                  Create your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegisterSubmit} noValidate>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name"
                      value={registerName}
                      onChange={handleRegisterNameChange}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                    {registerPassword.length > 0 && registerPassword.length < 6 && (
                      <p className="text-xs text-destructive">Password must be at least 6 characters.</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="passkey"
                      type="password"
                      placeholder="Passkey"
                      value={registerPasskey}
                      onChange={(e) => setRegisterPasskey(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  {registerError && <p className="text-sm text-center text-destructive">{registerError}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white"
                    type="submit"
                    disabled={registerLoading || isRegisterFormInvalid}
                  >
                    {registerLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Register'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="underline underline-offset-2 text-white hover:text-cyan-400"
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="w-full max-w-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline text-cyan-400">
                  Login
                </CardTitle>
                <CardDescription>Access your kitchen</CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit} noValidate>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  {loginError && (
                    <p className="text-sm text-center text-destructive">{loginError}</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white"
                    type="submit"
                    disabled={loginLoading || isLoginFormInvalid}
                  >
                    {loginLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Login'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="underline underline-offset-2 text-white hover:text-cyan-400"
                    >
                      Register
                    </button>
                  </p>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        Powered by <span className="text-cyan-400">OrderEase</span> © 2025
      </footer>
    </div>
  );
}
