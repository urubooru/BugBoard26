import jwt from 'jsonwebtoken';
//https://www.npmjs.com/package/jsonwebtoken
//definiamo il payload come mail e isAdmin
//non contiene la password in quanto facilmente decodificiabile
export type JwtPayload = {
  email: string;
  isAdmin: boolean;
};

//funzione che prende un payload, una secret key e un tempo di scadenza(5m) e ci da un token
//l'header è generato da jsonWebToken
export function signJwt(payload: JwtPayload, expires = 300) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expires });
}

//funzione che prende un token e lo verifica con la chiave, se si ritorna
//as JWTpayload è un type assertion di TS
export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
