import { NextResponse } from 'next/server';
import { signJwt } from '../../../lib/jwt';
import jwt from 'jsonwebtoken';

// endpoint per ottenere un token "guest" (no permessi admin)
// non esiste un utente con mail "guest" quindi non dovrebbero esserci conflitti
export async function GET(testing: boolean = false) {
  if(!testing){
    const token = signJwt({ email: 'guest', isAdmin: false });
    return NextResponse.json({ token, email: 'guest', isAdmin: false } , { status: 200 });
  }

  const mockSignJwt = () => {
    return jwt.sign({ email : 'guest', isAdmin: false }, "secret-key-mock", { expiresIn: 5 });
  }
  const token = mockSignJwt();
  return NextResponse.json({ token: token, email: 'guest', isAdmin: false } ,{ status: 200 });
}
