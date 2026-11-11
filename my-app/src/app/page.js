'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

// Importy komponentów UI
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Wywołuję zapytanie pod URL:", pb.buildURL('/api/collections/uzytkownicy/auth-with-password'));
    try {
      
      const authData = await pb.collection('uzytkownicy').authWithPassword(email, password);
      
      
      if (authData.record.rola === 'technik') {
        router.push('/technik');
      } else {
        router.push('/moje-zgloszenia');
      }
    } catch (err) {
  
     console.log('Pełny obiekt błędu:', err);
  
      const status = err?.status || 'brak statusu';
      const rawResponse = JSON.stringify(err?.response || err?.data || {}, null, 2);
  
     alert(`STATUS: ${status}\n\nODPOWIEDŹ SERWERA:\n${rawResponse}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Zaloguj się</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Hasło" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Zaloguj</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}