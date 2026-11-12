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
  
  // Zwykłe stany dla każdego pola z osobna (najprościej do zrozumienia)
  const [tytul, setTytul] = useState('');
  const [opis, setOpis] = useState('');
  const [sala, setSala] = useState('1');
  const [kategoria, setKategoria] = useState('sprzet komputerowy');
  const [priorytet, setPriorytet] = useState('sredni');
  const [plik, setPlik] = useState(null);

  useEffect(() => {
    // Jak nie jesteś zalogowany, to wywala na stronę główną
    if (!pb.authStore.isValid) {
      router.push('/');
    } else {
      pobierz();
    }
  }, [router]);

  async function pobierz() {
    const dane = await pb.collection('zgloszenia').getFullList({
      sort: '-created',
    });
    setLista(dane);
  }

  async function wyslij(e) {
    e.preventDefault();

    try {
      // Pakujemy dane do wysłania
      const formData = new FormData();
      formData.append('tytul', tytul);
      formData.append('opis', opis);
      formData.append('sala', sala);
      formData.append('kategoria', kategoria);
      formData.append('priorytet', priorytet);
      formData.append('autor', pb.authStore.record.id);

      // Jak ktoś wybrał plik, to go dorzucamy
      if (plik) {
        formData.append('file', plik);
      }

      await pb.collection('zgloszenia').create(formData);

      // Czyścimy pola po wysłaniu
      setTytul('');
      setOpis('');
      setPlik(null);
      e.target.reset();

      alert('Wysłano!');
      pobierz(); // Odświeżamy listę
    } catch (blad) {
      alert('Coś poszło nie tak: ' + blad.message);
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
          <form onSubmit={wyslij} className="space-y-3">
            <Input placeholder="Tytuł" value = {tytul} onChange={(e) => setTytul(e.target.value)} required />
            <Input placeholder="Opis problemu" value={opis} onChange={(e) => setOpis(e.target.value)}required  />

            <div className="grid grid-cols-3 gap-2">
              <select className="border rounded p-2 text-sm" value={sala} onChange={(e) => setSala(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>Sala {n}</option>
                ))}
              </select>

              <select className="border rounded p-2 text-sm" value={kategoria} onChange={(e) => setKategoria(e.target.value)}>
                <option value="sprzet komputerowy">Sprzęt komputerowy</option>
                <option value="multimedia">Multimedia</option>
              </select>

              <select className="border rounded p-2 text-sm" value={priorytet} onChange={(e) => setPriorytet(e.target.value)}>
                <option value="niski">Niski</option>
                <option value="sredni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>

            <Input type="file" onChange={(e) => setPlik(e.target.files[0])} 
            />
            <Button type="submit" className="w-full">Wyślij</Button>
          </form>
        </CardContent>
      </Card>
{/* Lista zgloszen uzytkownika  */}
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