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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Motyw } from '@/components/Motyw';

const zasadyEdycji = z.object({
  status: z.string(),
  komentarz: z.string().min(3, 'Komentarz musi mieć minimum 3 znaki'),
});

export default function TechnikPage() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [filtrStatus, setFiltrStatus] = useState('wszystkie');
  const [filtrSala, setFiltrSala] = useState('wszystkie');
  const [filtrPriorytet, setFiltrPriorytet] = useState('wszystkie');
  const [edytowaneZgloszenie, setEdytowaneZgloszenie] = useState(null);
  const [historia, setHistoria] = useState([]);
  const form = useForm({
   resolver: zodResolver(zasadyEdycji),
  });


useEffect(() => {
  if (!pb.authStore.isValid || pb.authStore.model?.rola !== 'technik') {
    router.push('/');
  } else {
    pobierz();

    pb.collection('zgloszenia').subscribe('*', () => {
      pobierz();
    });

    return () => {
      pb.collection('zgloszenia').unsubscribe('*');
    };
  }
}, [router]);

async function pobierz() {
  const dane = await pb.collection('zgloszenia').getFullList({
    sort: '-created',
  });
  setLista(dane);

  const wpisy = await pb.collection('ticket_events').getFullList({
      sort: '-created',
      expand: 'user,zgloszenie',
    });
    setHistoria(wpisy);
}

function otworzEdycje(item) {
  setEdytowaneZgloszenie(item);
  form.reset({
    status: item.status || 'nowe',
    komentarz: item.komentarz || '',
  });
}

async function zapiszZmiany(dane) {
  try {
// ticket events
if (edytowaneZgloszenie.status !== dane.status) {
      await pb.collection('ticket_events').create({
        zgloszenie: edytowaneZgloszenie.id,
        user: pb.authStore.record.id,
        stary_status: edytowaneZgloszenie.status,
        nowy_status: dane.status,
      });
    }

    await pb.collection('zgloszenia').update(edytowaneZgloszenie.id, {
      status: dane.status,
      komentarz: dane.komentarz,
    });

    setEdytowaneZgloszenie(null);
    alert('Zaktualizowano zgłoszenie');
    pobierz();
  } catch (blad) {
    alert('Błąd zapisu: ' + blad.message);
  }
}
 
  const przefiltrowanaLista = lista.filter((item) => {
  if (filtrStatus !== 'wszystkie' && item.status !== filtrStatus) return false;
  if (filtrSala !== 'wszystkie' && item.sala !== filtrSala) return false;
  if (filtrPriorytet !== 'wszystkie' && item.priorytet !== filtrPriorytet) return false;
  return true;
});

const otwarte = lista.filter((item) => item.status !== 'zamkniete').length;


const sprzet = lista.filter((item) => item.kategoria === 'sprzet komputerowy').length;
const multimedia = lista.filter((item) => item.kategoria === 'multimedia').length;


const licznikSal = {};
let najczestszaSala = '-';
let maxZgloszen = 0;
for (let nrSali = 1; nrSali <= 10; nrSali++) {
  let ileWTejSali = 0;

  for (let i = 0; i < lista.length; i++) {
    if (lista[i].sala == nrSali) {
      ileWTejSali = ileWTejSali + 1;
    }
  }

if (ileWTejSali > maxZgloszen) {
    maxZgloszen = ileWTejSali;
    najczestszaSala = 'Sala ' + nrSali + ' (' + maxZgloszen + ')';
  }
}

function wyloguj() {
  pb.authStore.clear();
  router.push('/');
}

return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wszystkie zgłoszenia</h1>
        <Motyw />
        <Button variant="outline" onClick={wyloguj}>Wyloguj</Button>
        
      </div>
     {/* Dashboard*/}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">Otwarte zgłoszenia</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{otwarte}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">Zgłoszenia wg kategorii</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p>Sprzęt komputerowy: <b>{sprzet}</b></p>
        <p>Multimedia: <b>{multimedia}</b></p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">Najczęstsza sala</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{najczestszaSala}</p>
     </CardContent>
    </Card>
  </div> 
  
    {edytowaneZgloszenie && (
  <Card className="border-blue-500">
    <CardHeader>
      <CardTitle>Edycja zgłoszenia: {edytowaneZgloszenie.tytul}</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={form.handleSubmit(zapiszZmiany)} className="space-y-3">
        <div>
          <label className="text-xs font-bold block mb-1">Status:</label>
          <select {...form.register('status')} className="w-full border p-2 rounded">
            <option value="nowe">Nowe</option>
            <option value="w realizacji">W realizacji</option>
            <option value="zamkniete">Zamknięte</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Komentarz technika:</label>
          <Input placeholder="Wpisz notatkę lub rozwiązanie..." {...form.register('komentarz')} />
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.komentarz?.message}</p>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Zapisz zmiany</Button>
          <Button type="button" variant="outline" onClick={() => setEdytowaneZgloszenie(null)}>
            Anuluj
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
)}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded border">
<div>
    <label className="text-xs font-bold block mb-1">Filtruj po statusie:</label>
    <select
      value={filtrStatus}
      onChange={(e) => setFiltrStatus(e.target.value)}
      className="w-full border p-2 rounded text-sm"
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
              <TableHead>Akcja</TableHead>
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
                <TableCell>
                  <Button size="sm" onClick={() => otworzEdycje(item)}>
                   Edytuj
                  </Button>
              </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-lg font-bold">Historia zmian statusów</h2>
        {historia.length === 0 && (
          <p className="text-sm text-gray-500">Brak zarejestrowanych zmian.</p>
        )}
        {historia.map((h) => (
          <div key={h.id} className="text-sm border p-3 rounded">
            <b>{h.expand?.zgloszenie?.tytul || 'Zgłoszenie'}</b>: zmiana z{' '}
            <span className="font-semibold">{h.stary_status}</span> na{' '}
            <span className="font-semibold">{h.nowy_status}</span> — przez:{' '}
            {h.expand?.user?.email || h.user} ({new Date(h.created).toLocaleString('pl-PL')})
          </div>
        ))}
      </div>
    </div>
    
  );
}