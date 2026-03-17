import { NextResponse } from 'next/server';
import { dbConnection } from '../../dbConnection';

//API per gestire POST su questo endpoint, riceve request e se va tutto bene inserisce un utente
//Gestisce anche attentamente la SQLinjection
export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore durante la creazione utente:', error);
    return NextResponse.json({ error: 'Impossibile creare utente' }, { status: 500 });
  }
}
