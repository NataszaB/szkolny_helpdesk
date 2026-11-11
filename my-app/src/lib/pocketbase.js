import PocketBase from 'pocketbase';

console.log("Łączę z PocketBase pod adresem:", process.env.NEXT_PUBLIC_POCKETBASE_URL);
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

pb.autoCancellation(false);