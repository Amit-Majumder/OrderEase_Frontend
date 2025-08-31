
'use client';

import { Header } from '@/components/Header';
import { MenuItemCard } from '@/components/MenuItemCard';
import menuData from '@/lib/menu-data.json';
import type { MenuItem } from '@/lib/types';
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function MenuPage() {
  const categories = ['Starters', 'Heavy Snacks', 'Rice & Noodles', 'Sides'];
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToCategory = (category: string) => {
    sectionRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Our Menu</h1>
          <p className="text-lg text-muted-foreground mt-2">Freshly prepared, just for you.</p>
        </div>

        <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 mb-8 border-b">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="rounded-full shadow-sm"
                onClick={() => scrollToCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {categories.map((category) => (
            <section
              key={category}
              id={category.toLowerCase()}
              ref={(el) => (sectionRefs.current[category] = el)}
              className="scroll-mt-[140px]"
            >
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold font-headline">{category}</h2>
                <div className="flex-grow border-t-2 border-dashed border-primary/20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuData
                  .filter((item) => item.category === category)
                  .map((item: MenuItem) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
