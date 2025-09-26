
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CustomerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="customerGradient" x1="12" y1="4" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
        </defs>
        <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" fill="url(#customerGradient)" />
        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="url(#customerGradient)"/>
    </svg>
);

const VendorIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="url(#paint0_linear_1_2)"/>
        <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="url(#paint1_linear_1_2)"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7"/>
                <stop offset="1" stopColor="#EC4899"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="12" y1="6" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7"/>
                <stop offset="1" stopColor="#EC4899"/>
            </linearGradient>
        </defs>
    </svg>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-headline text-cyan-400">
            Welcome to OrderEase
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            The simplest way to manage your food orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-4xl">
          <Card className="bg-card border-border hover:shadow-2xl hover:shadow-cyan-500/10 transition-shadow duration-300">
            <CardHeader className="items-center text-center">
                <div className="bg-green-500/10 p-4 rounded-full">
                    <CustomerIcon />
                </div>
              <CardTitle className="font-headline text-3xl mt-4">
                I'm a Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Browse the menu, place an order, and enjoy your meal.
              </p>
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity">
                <Link href="/menu">
                  Go to Menu <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-300">
            <CardHeader className="items-center text-center">
               <div className="bg-purple-500/10 p-4 rounded-full">
                    <VendorIcon />
                </div>
              <CardTitle className="font-headline text-3xl mt-4">
                I'm a Vendor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                View and manage incoming orders from your kitchen.
              </p>
               <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity">
                <Link href="/kitchen/login">
                  Open Kitchen View <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-center p-4 text-muted-foreground text-sm">
        Powered by <span className="text-cyan-400">OrderEase</span> © 2025
      </footer>
    </div>
  );
}
