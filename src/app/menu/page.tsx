
'use client';

import { Header } from '@/components/Header';
import { MenuItemCard } from '@/components/MenuItemCard';
import type { MenuItem } from '@/lib/types';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await axiosInstance.get(`/api/menu`);
        if (response.data && Array.isArray(response.data)) {
          const formattedMenuItems: MenuItem[] = response.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: `${item.imageUrl}.jpg`, // Assuming .jpg extension is needed
            category: item.category,
          }));

          const uniqueCategories = Array.from(new Set(formattedMenuItems.map(item => item.category)));

          setMenuItems(formattedMenuItems);
          setCategories(uniqueCategories);
        } else {
            throw new Error("Invalid data format from API");
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Could not load the menu. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

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

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : error ? (
           <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <>
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
                  id={category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}
                  ref={(el) => (sectionRefs.current[category] = el)}
                  className="scroll-mt-[140px]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold font-headline">{category}</h2>
                    <div className="flex-grow border-t-2 border-dashed border-primary/20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems
                      .filter((item) => item.category === category)
                      .map((item: MenuItem) => (
                        <MenuItemCard key={item.id} item={item} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
