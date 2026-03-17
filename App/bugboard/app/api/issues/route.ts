import { NextResponse } from 'next/server';
import { dbConnection } from '../../dbConnection';

//API che gestisce GET su questo endpoint, restituisce tutte le issue
export async function GET() {
  let issues: any[] = [];
  let etichette: any[] = [];

  try {
    const con = dbConnection.getConnection();
    issues = await con`SELECT * FROM Issue`;
    etichette = await con`SELECT * FROM etichetta`;
    dbConnection.closeConn();
  } catch (error) {
    console.log("Errore durante la connessione al database: ", error);
    return NextResponse.json({ error: 'Impossibile caricare le issue' }, { status: 500 });
  }

  //funzione per associare a ogni issue le sue etichette
  //mappiamo a ogni number(id) una lista di stringhe(etichette)
  //poi creiamo una lista di issue e la inseriamo nella mappa
  const tagsByIssue = new Map<number, string[]>();
  for (const tag of etichette) {
    //prendiamo la lista di etichette dell'issue, se non c'è ne creiamo una vuota nuova
    const list = tagsByIssue.get(tag.issue) ?? [];
    list.push(tag.etichetta);
    tagsByIssue.set(tag.issue, list);
  }

  //
  const issuesWithTags = issues.map((issue: any) => ({
    issueid : issue.issueid,
    titolo: issue.titolo,
    descrizione: issue.descrizione,
    tipo: issue.tipo,
    stato: issue.stato,
    priority: issue.priority,
    imageUrl: issue.imageurl,
    etichette: tagsByIssue.get(issue.issueid) ?? [],
  }));

  return NextResponse.json(issuesWithTags);
}
