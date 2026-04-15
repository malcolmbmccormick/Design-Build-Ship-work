import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';
import { Book } from '@/types/book';
import ShelfContent from './ShelfContent';

export default async function ShelfPage() {
  const { userId } = await auth();
  const supabase = getSupabase();

  const { data } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId!)
    .order('created_at', { ascending: false });

  return <ShelfContent initialBooks={(data ?? []) as Book[]} />;
}
