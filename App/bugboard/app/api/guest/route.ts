import { NextResponse } from 'next/server';
import { signJwt } from '../../../lib/jwt';

// endpoint per ottenere un token "guest" (no permessi admin)
// non esiste un utente con mail "guest" quindi non dovrebbero esserci conflitti
export async function GET() {
  const token = signJwt({ email: 'guest', isAdmin: false });
  return NextResponse.json({ token, email: 'guest', isAdmin: false });
}
