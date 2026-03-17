'use server'
import { dbConnection } from './dbConnection';

//pagina dedicata alle funzioni che agiscono sul database
//obiettivo: rimuoverla dopo per altri endpoint

//funzione per creare un nuovo utente, creiamo la connessione, gestiamo la SQLinjection, inseriamo, chiudiamo la connessione
export async function createUser(email: string, password: string, isAdmin: boolean) {
  try {
    const con = dbConnection.getConnection();
    const correctMail = email.split(';')[0].trim();
    const correctPwd = password.split(';')[0].trim();
    await con`INSERT INTO Utente (email, pwd, isadmin) VALUES (${correctMail}, ${correctPwd}, ${isAdmin})`;
    dbConnection.closeConn();
    return { success: true };
  } catch (error) {
    console.error('Errore durante la creazione utente:', error);
    return { success: false, error: 'Impossibile creare utente' };
  }
}

//funzione per controllare le info di login che restituisce l'utente
export async function checkLoginInfo(email: string, password: string) {
  let users: any[] = [];

  try {
    const con = dbConnection.getConnection();
    users = await con`SELECT * FROM Utente WHERE email = ${email} AND pwd = ${password}`;
    dbConnection.closeConn();
  } catch (error) {
    console.log("Errore durante la connessione al database: ", error);
    return null;
  }

  if (users.length > 0) {
    return users[0];
  } else {
    return null;
  }
}

export async function getAllIssues() {
  let issues: any[] = [];

  try {
    const con = dbConnection.getConnection();
    issues = await con`SELECT * FROM Issue`;
    dbConnection.closeConn();
  } catch (error) {
    console.log("Errore durante la connessione al database: ", error);
    return [];
  }

  return issues;
}
