'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TechnikPage() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [filtrStatus, setFiltrStatus] = useState('wszystkie');
  const [filtrSala, setFiltrSala] = useState('wszystkie');
  const [filtrPriorytet, setFiltrPriorytet] = useState('wszystkie');

  useEffect(() => {
    if (!pb.authStore.isValid || pb.authStore.record?.rola !== 'technik') {
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

  function wyloguj() {
    pb.authStore.clear();
    router.push('/');
  }
  const przefiltrowanaLista = lista.filter((item) => {
  if (filtrStatus !== 'wszystkie' && item.status !== filtrStatus) return false;
  if (filtrSala !== 'wszystkie' && item.sala !== filtrSala) return false;
  if (filtrPriorytet !== 'wszystkie' && item.priorytet !== filtrPriorytet) return false;
  return true;
});

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wszystkie zgłoszenia</h1>
        <Button variant="outline" onClick={wyloguj}>Wyloguj</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded border">
  <div>
    <label className="text-xs font-bold block mb-1">Filtruj po statusie:</label>
    <select
      value={filtrStatus}
      onChange={(e) => setFiltrStatus(e.target.value)}
      className="w-full border p-2 rounded bg-white text-sm"
    >
      <option value="wszystkie">Wszystkie statusy</option>
      <option value="nowe">Nowe</option>
      <option value="w realizacji">W realizacji</option>
      <option value="zamkniete">Zamknięte</option>
    </select>
  </div>

  <div>
    <label className="text-xs font-bold block mb-1">Filtruj po sali:</label>
    <select
      value={filtrSala}
      onChange={(e) => setFiltrSala(e.target.value)}
      className="w-full border p-2 rounded bg-white text-sm"
    >
      <option value="wszystkie">Wszystkie sale</option>
      <option value="1">Sala 1</option>
      <option value="2">Sala 2</option>
      <option value="3">Sala 3</option>
      <option value="4">Sala 4</option>
      <option value="5">Sala 5</option>
    </select>
  </div>

  <div>
    <label className="text-xs font-bold block mb-1">Filtruj po priorytecie:</label>
    <select
      value={filtrPriorytet}
      onChange={(e) => setFiltrPriorytet(e.target.value)}
      className="w-full border p-2 rounded bg-white text-sm"
    >
      <option value="wszystkie">Wszystkie priorytety</option>
      <option value="niski">Niski</option>
      <option value="sredni">Średni</option>
      <option value="wysoki">Wysoki</option>
    </select>
  </div>
</div>

      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tytuł i opis</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Priorytet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Komentarz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {przefiltrowanaLista.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-bold">{item.tytul}</p>
                  <p className="text-gray-600">{item.opis}</p>
                  {item.file && (
                    <a
                      href={pb.files.getURL(item, item.file)}
                      target="_blank"
                      className="text-blue-600 underline text-xs"
                    >
                      Zobacz zdjęcie
                    </a>
                  )}
                </TableCell>
                <TableCell>Sala {item.sala}</TableCell>
                <TableCell>{item.priorytet}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.komentarz || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}