'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MojeZgloszeniaPage() {
  const router = useRouter();
  const [lista, setLista] = useState([]);

  const zaladuj = async () => {
    const rekordy = await pb.collection('zgloszenia').getFullList({ sort: '-created' });
    setLista(rekordy);
  };

  useEffect(() => {
    if (!pb.authStore.isValid) return router.push('/login');
    zaladuj();
  }, [router]);

  const wyslij = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('autor', pb.authStore.model.id);

    try {
      await pb.collection('zgloszenia').create(formData);
      e.target.reset();
      zaladuj();
      alert('Dodano zgłoszenie!');
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Moje zgłoszenia</h1>
        <Button variant="outline" onClick={() => { pb.authStore.clear(); router.push('/login'); }}>
          Wyloguj
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Nowe zgłoszenie</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={wyslij} className="space-y-3">
            <Input name="tytul" placeholder="Tytuł" required />
            <Input name="opis" placeholder="Opis problemu" required />

            <div className="grid grid-cols-3 gap-2">
              <select name="sala" className="border rounded p-2 text-sm">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>Sala {n}</option>
                ))}
              </select>

              <select name="kategoria" className="border rounded p-2 text-sm">
                <option value="sprzet komputerowy">Sprzęt komputerowy</option>
                <option value="multimedia">Multimedia</option>
              </select>

              <select name="priorytet" className="border rounded p-2 text-sm">
                <option value="niski">Niski</option>
                <option value="sredni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>

            <Input name="file" type="file" />
            <Button type="submit" className="w-full">Wyślij</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {lista.map((z) => (
          <Card key={z.id}>
            <CardContent className="pt-4">
              <p className="font-bold">{z.tytul} (Sala {z.sala})</p>
              <p className="text-sm text-gray-600">{z.opis}</p>
              <p className="text-xs text-gray-400 mt-1">{z.kategoria} • priorytet: {z.priorytet}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}