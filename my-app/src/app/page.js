'use client';

import { useState } from 'react';
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
  password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
});

export default function LoginPage() {
  const router = useRouter();
  const [czyRejestracja, setCzyRejestracja] = useState(false);

  const form = useForm({
    resolver: zodResolver(zasady),
  });

  async function obsluzFormularz(dane) {
    try {
      if (czyRejestracja) {
        // Tworzenie nowego konta w PocketBase
        await pb.collection('uzytkownicy').create({
          email: dane.email,
          password: dane.password,
          passwordConfirm: dane.password,
          rola: 'uzytkownik',
        });
      }

   
      const authData = await pb.collection('uzytkownicy').authWithPassword(dane.email, dane.password);

      if (authData.record.rola === 'technik') {
        router.push('/technik');
      } else {
        router.push('/moje-zgloszenia');
      }
    } catch (blad) {
      alert(czyRejestracja ? 'Nie udało się założyć konta (może email jest już zajęty?)' : 'Zły email albo hasło');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {czyRejestracja ? 'Załóż konto' : 'Zaloguj się'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(obsluzFormularz)}>
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
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">
              {czyRejestracja ? 'Zarejestruj' : 'Zaloguj'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                setCzyRejestracja(!czyRejestracja);
                form.clearErrors();
              }}
            >
              {czyRejestracja ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}