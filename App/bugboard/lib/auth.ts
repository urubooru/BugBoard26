import { verifyJwt, JwtPayload } from './jwt';

//funzione che prende il token nell'header authorization
export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? '';
  return auth.trim() || null;
}

//funzione che verifica se il token è valido
//se il token è valido allora ritorna il payload tramite la funzione verifyJwt
export function requireAuth(request: Request): JwtPayload {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error('Token mancante');
  }
  return verifyJwt(token);
}

//funzione che verifica se il token è admin
export function requireAdmin(request: Request): JwtPayload {
  const payload = requireAuth(request);
  if (!payload.isAdmin) {
    throw new Error('Permessi insufficienti');
  }
  return payload;
}
