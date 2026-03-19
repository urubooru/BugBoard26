import { NextResponse } from 'next/server';
import { dbConnection } from '../../db/dbConnection';
import { requireAdmin } from '../../lib/auth';

//API per gestire POST su questo endpoint, riceve request e se va tutto bene inserisce un utente
//Gestisce anche attentamente la SQLinjection
export async function POST(request: Request) {
  try {
    //in questo caso serve che l'utente sia un admin
    const method = request.method;
    if (method !== 'POST') {
      return NextResponse.json({ error: 'Metodo non supportato' }, { status: 405 });
    }

    try {
      requireAdmin(request);
    } catch (err) {
      const message = (err as Error).message;
      return NextResponse.json(
        { error: message },
        { status: message.includes('Permessi') ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { email, password, isAdmin } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono richiesti' }, { status: 400 });
    }

    const con = dbConnection.getConnection();
    const correctMail = email.split(';')[0].trim();
    const correctPwd = password.split(';')[0].trim();
    await con`INSERT INTO Utente (email, pwd, isadmin) VALUES (${correctMail}, ${correctPwd}, ${isAdmin ?? false})`;
    dbConnection.closeConn();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Errore durante la creazione utente:', error);
    return NextResponse.json({ error: 'Impossibile creare utente' }, { status: 500 });
  }
}
