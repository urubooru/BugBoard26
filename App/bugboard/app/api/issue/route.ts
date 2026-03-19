import { NextResponse } from 'next/server';
import { dbConnection } from '../../db/dbConnection';
import { requireAuth } from '../../lib/auth';

export async function POST(request: Request) {
  try {
    requireAuth(request);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }

  const method = request.method;
  if (method !== 'POST') {
    return NextResponse.json({ error: 'Metodo non supportato' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { issueid, stato } = body;

    if (!issueid || !stato) {
      return NextResponse.json({ error: 'issueid e stato sono richiesti' }, { status: 400 });
    }

    const issueIdNumber = Number(issueid);
    if (!issueIdNumber) {
      return NextResponse.json({ error: 'issueid non valido' }, { status: 400 });
    }

    const cleanStato = String(stato).split(';')[0].trim();

    const con = dbConnection.getConnection();
    await con`UPDATE Issue SET stato = ${cleanStato} WHERE issueid = ${issueIdNumber}`;
    dbConnection.closeConn();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore durante l’aggiornamento dello stato issue:', error);
    return NextResponse.json({ error: 'Impossibile aggiornare lo stato' }, { status: 500 });
  }
}
