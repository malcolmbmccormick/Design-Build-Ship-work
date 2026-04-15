'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { BookStatus } from '@/types/book';

export async function addBook(data: {
  title: string;
  author: string;
  genre?: string;
  status: BookStatus;
  rating?: number;
  quotes?: string;
  thoughts?: string;
  cover_url?: string;
  description?: string;
  page_count?: number;
  open_library_key?: string;
  date_started?: string;
  date_finished?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = getSupabase();
  const { error } = await supabase.from('books').insert({
    user_id: userId,
    ...data,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/shelf');
}

export async function deleteBook(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = getSupabase();
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/shelf');
}
