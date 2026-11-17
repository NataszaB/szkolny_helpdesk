'use client';

import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const zasady = z.object({
  email: z.email('Wpisz poprawny email'),
  password: z.string().min(1, 'Wpisz hasło'),
});

export default function LoginPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(zasady),
  });

  async function zaloguj(dane) {
    try {
      const authData = await pb.collection('uzytkownicy').authWithPassword(dane.email, dane.password);

      if (authData.record.rola === 'technik') {
        router.push('/technik');
      } else {
        router.push('/moje-zgloszenia');
      }
    } catch (blad) {
      alert('Zły email albo hasło');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Zaloguj się</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(zaloguj)}>
          <CardContent className="space-y-4">
            <div>
              <Input type="email" placeholder="Email" {...form.register('email')} />
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.email?.message}</p>
            </div>

            <div>
              <Input type="password" placeholder="Hasło" {...form.register('password')} />
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.password?.message}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Zaloguj</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}