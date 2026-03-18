import { NextResponse } from 'next/server';
import { dbConnection } from '../../dbConnection';
import { signJwt } from '../../../lib/jwt';

//API endpoint per gestire il login, gestisce anche SQLinjection e restituisce un JWT
export async function POST(request: Request) {
  try {
    const method = request.method;
    if (method !== 'POST') {
      return NextResponse.json({ error: 'Metodo non supportato' }, { status: 405 });
    }

    const body = await request.json();
    const { email, password } = body;
    

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono richiesti' }, { status: 400 });
    }

    const correctMail = email.split(';')[0].trim();
    const correctPwd = password.split(';')[0].trim();

    const con = dbConnection.getConnection();
    const users = await con`SELECT email, isadmin FROM Utente WHERE email = ${correctMail} AND pwd = ${correctPwd}`;
    dbConnection.closeConn();

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const user = users[0];
    const isAdmin = Boolean(user.isadmin ?? user.isAdmin);
    //creazione token che verrà ritornato al client
    const token = signJwt({ email: user.email, isAdmin });

    return NextResponse.json({ email: user.email, isAdmin, token }, { status: 200 });
  } catch (error) {
    console.error('Errore login:', error);
    return NextResponse.json({ error: 'Errore interno durante il login' }, { status: 500 });
  }
}
