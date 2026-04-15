import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

interface OLDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const q = request.nextUrl.searchParams.get('q');
  if (!q?.trim()) return Response.json([]);

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median&limit=6`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) return Response.json([]);

  const data = await res.json();

  const books = (data.docs ?? []).map((doc: OLDoc) => ({
    key: doc.key,
    title: doc.title ?? '',
    author: doc.author_name?.[0] ?? '',
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
    year: doc.first_publish_year,
    page_count: doc.number_of_pages_median ?? null,
  }));

  return Response.json(books);
}
