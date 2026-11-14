'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


// Zasady sprawdzania pól
const zasady = z.object({
  tytul: z.string().min(3, 'Wpisz minimum 3 znaki'),
  opis: z.string().min(5, 'Opisz problem (min. 5 znaków)'),
  sala: z.string(),
  kategoria: z.string(),
  priorytet: z.string(),
});


export default function MojeZgloszeniaPage() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [plik, setPlik] = useState(null);

  const form = useForm({
    resolver: zodResolver(zasady),
  });

  useEffect(() => {
  
    if (!pb.authStore.isValid) {
      router.push('/');
    } else {
      pobierz();
    }
  }, [router]);

  async function pobierz() {
    const dane = await pb.collection('zgloszenia').getFullList({
      filter: `autor = "${pb.authStore.model.id}"`,
      sort: '-created',
    });
    setLista(dane);
  }

  async function wyslij(e) {
    e.preventDefault();

    try {
      
      const formData = new FormData();
      formData.append('tytul', tytul);
      formData.append('opis', opis);
      formData.append('sala', sala);
      formData.append('kategoria', kategoria);
      formData.append('priorytet', priorytet);
      formData.append('autor', pb.authStore.record.id);
      formData.append('status', 'nowe');
      
      if (plik) {
        formData.append('file', plik);
      }

      await pb.collection('zgloszenia').create(formData);

      form.reset();
     
      setPlik(null);
      e.target.reset();

      
      pobierz();
    } catch (blad) {
      alert('Blad: ' + blad.message);
    }
  }

  function wyloguj() {
    pb.authStore.clear();
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Moje zgłoszenia</h1>
        <Button variant="outline" onClick={wyloguj}>
          Wyloguj
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Nowe zgłoszenie</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(wyslij)} className="space-y-3">
            <Input placeholder="Tytuł" {...form.register('tytul')} />
            <p>{form.formState.errors.tytul?.message}</p>
            <Input placeholder="Opis problemu" {...form.register('opis')}  />
            <p>{form.formState.errors.opis?.message}</p>

            
            <div className="grid grid-cols-3 gap-2">
              <select {...form.register('sala')}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>Sala {n}</option>
                ))}
              </select>

              <select {...form.register('kategoria')}>
                <option value="sprzet komputerowy">Sprzęt komputerowy</option>
                <option value="multimedia">Multimedia</option>
              </select>

              <select {...form.register('priorytet')}>
                <option value="niski">Niski</option>
                <option value="sredni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>

            <Input type="file" onChange={(e) => setPlik(e.target.files[0])} />
            
            <Button type="submit">Wyślij</Button>
          </form>
        </CardContent>
      </Card>
{/* Lista zgloszen uzytkownika  */}
   <div className="space-y-2">
        <h2 className="font-bold">Twoje zgłoszenia:</h2>
        
        {lista.length === 0 && (
          <p className="text-gray-500">Nie masz jeszcze żadnych zgłoszeń.</p>
        )}

        {lista.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <p className="font-bold">{item.tytul}</p>
                
               
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {item.status}
                </span>
              </div>
              
              <p className="text-sm">{item.opis}</p>
              <p className="text-xs text-gray-500">
                Sala: {item.sala} | Kategoria: {item.kategoria} | Priorytet: {item.priorytet}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
  
  );
}