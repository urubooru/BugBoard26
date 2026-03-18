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

  //crea lista issue con anche le etichette associate
  const issuesWithTags = issues.map((issue: any) => ({
    issueid : issue.issueid,
    titolo: issue.titolo,
    descrizione: issue.descrizione,
    tipo: issue.tipo,
    stato: issue.stato,
    priority: issue.priority,
    imageurl: issue.imageurl,
    etichette: tagsByIssue.get(issue.issueid) ?? [],
  }));

  return NextResponse.json(issuesWithTags);
}

//API che gestisce POST su questo endpoint, crea una nuova issue
export async function POST(request: Request) {
  let devstringlol = "base";
  try {
    
    const body = await request.json();
    const { titolo, descrizione, tipo, stato, priority, imageurl, etichette } = body;

    if (!titolo || !descrizione || !tipo) {
      return NextResponse.json({ error: 'Titolo, descrizione e tipo sono richiesti' }, { status: 400 });
    }

    const con = dbConnection.getConnection();

    // onestamente non ho ben capito come mai si estrapoli direttamente il
    // valore in questo modo, ma se funziona non tocco
    const res = await con`SELECT MAX(issueid) as maxid FROM Issue`;
    const nextId = (Number(res[0].maxid)) ? Number(res[0].maxid) + 1 : 1;


    //gestione SQLinj
    const cleanTitolo = String(titolo).split(';')[0].trim();
    const cleanDescrizione = String(descrizione).split(';')[0].trim();
    const cleanTipo = String(tipo).split(';')[0].trim();
    const cleanImage = imageurl ? String(imageurl).split(';')[0].trim() : null;
    const cleanPriority = Number(priority) || 0;

    //insert issue
    //devstringlol = `INSERT INTO Issue (issueid, titolo, descrizione, tipo, stato, priority, imageURL) VALUES (${nextId}, ${cleanTitolo}, ${cleanDescrizione}, ${cleanTipo}, ${stato}, ${cleanPriority}, ${cleanImage})`;
    await con`INSERT INTO Issue (issueid, titolo, descrizione, tipo, stato, priority, imageURL) VALUES (${nextId}, ${cleanTitolo}, ${cleanDescrizione}, ${cleanTipo}, ${stato}, ${cleanPriority}, ${cleanImage})`;
    devstringlol = "issue inserita";

    //se ci sono etichette allora splitta su virgole
    const labels = Array.isArray(etichette)
      ? etichette.map((l: any) => String(l).split(',').filter(Boolean))
      : [];

    //gestione SQLinj etichette
    let cleanLabels: string[] = [];
    for(const label of labels) {
      cleanLabels.push(String(label).split(';')[0].trim());
    }

    for (const label of cleanLabels) {
      await con`INSERT INTO etichetta (issue, etichetta) VALUES (${nextId}, ${label})`;
    }

    dbConnection.closeConn();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore durante la creazione issue:', error);
    return NextResponse.json({ error: 'Impossibile creare issue ' + devstringlol }, { status: 500 });
  }
}
