'use client';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
     
      const authData = await pb.collection('uzytkownicy').authWithPassword(email, password);
      
      
      if (authData.record.rola === 'technik') {
        router.push('/technik');
      } else {
        router.push('/moje-zgloszenia');
      }
    } catch (err) {
      alert('Zły email lub hasło!');
    }
}
}

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
