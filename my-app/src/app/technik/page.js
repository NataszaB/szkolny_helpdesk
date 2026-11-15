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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wszystkie zgłoszenia</h1>
        <Button variant="outline" onClick={wyloguj}>Wyloguj</Button>
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
            {lista.map((item) => (
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