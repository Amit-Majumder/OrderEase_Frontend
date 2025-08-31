
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ChefHat, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary">
              Welcome to OrderEase
            </h1>
            <p className="text-xl text-muted-foreground mt-4">
              The simplest way to manage your food orders.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Utensils className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center font-headline text-3xl">
                  I'm a Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Browse the menu, place an order, and enjoy your meal.
                </p>
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
                  <Link href="/menu">
                    Go to Menu <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <ChefHat className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center font-headline text-3xl">
                  I'm a Vendor
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  View and manage incoming orders from your kitchen.
                </p>
                 <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
                  <Link href="/kitchen">
                    Open Kitchen View <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
