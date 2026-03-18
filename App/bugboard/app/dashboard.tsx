'use client'
import { useCallback, useEffect, useState } from 'react';
/*Dato che non abbiamo un effettivo bisogno di privatezza ne di metodi non creiamo delle classi in file separati*/
type Issue = {
  issueid: number;
  titolo: string;
  descrizione: string;
  tipo: string;
  stato: string;
  priority: number;
  imageurl?: string | null;
  etichette?: string[];
};

//i prop sono componenti in react read only, passati da chi chiama in questo caso la funzione
type DashboardProps = {
  user: { email: string; isAdmin: boolean } | null;
  isGuest: boolean;
  token: string | null;
  onLogout: () => void;
};

export default function Dashboard({ user, isGuest, token, onLogout }: Readonly<DashboardProps>) {
  //react states, hanno un valore e una funzione set di base
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //loadIssues, tramite fetch chiama l'endpoint /api/issues e se va bene abbiamo i nostri issues
  //asyncrona con await su fatch per far funzionare al primo login(dava errore se non era async, 
  // perché non aspettava la risposta e cercava di caricare prima le issue)
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `${token}`;
    }

    await fetch('/api/issues', { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Issue[]) => {
        data.sort((a, b) => a.issueid - b.issueid); //per ordinare tutti gli issue in base all'id
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        setIssues(data);
      })
      .catch(() => {
        setError('Impossibile caricare le issue');
      })
      .finally(() => setLoading(false));
  }, [token]);

  // useEffect esegue la funzione quando viene caricata (o quando cambia il token)
  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  //altri states per i filtri
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterStato, setFilterStato] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState({ tipo: '', stato: '' });

  //nel menù a tendina dei filtri mettiamo solo i tipi presenti nei nostri issue, quindi usiamo questa funzione
  //crea array da un set(quindi no duplicati) dei tipi degli issue, e filtra quelli vuoti o nulli
  const tipi = Array.from(new Set(issues.map((i) => i.tipo))).filter(Boolean);
  const stati = Array.from(new Set(issues.map((i) => i.stato))).filter(Boolean);

  //applichiamo i filtri agli issue, se è stato scelto un filtro e l'issue non corrisponde allora lo escludiamo
  //tutto ciò tramite una arrow function, simili a lambda ma non esattamente lambda
  const filteredIssues = issues.filter((issue) => {
    if (appliedFilters.tipo && issue.tipo !== appliedFilters.tipo) return false;
    if (appliedFilters.stato && issue.stato !== appliedFilters.stato) return false;
    return true;
  });

  //controllo se l'utente è admin o guest, per mostrare o nascondere alcune funzionalità
  const isAdmin = Boolean(user?.isAdmin);

  //states per gestione di visibilità e creazione utenti
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  //nelle <> typescript capisce che ci sono solo due valori possibili, mentre success è il default
  const [userMessageType, setUserMessageType] = useState<'success' | 'error'>('success');

  //crea nuovo utente, chiama endpoint /api/users con POST
  const handleAddUserSubmit = async () => {
    setUserMessage('');

    //se valori vuoti errore
    if (!newUserEmail || !newUserPassword) {
      setUserMessageType('error');
      setUserMessage('Inserisci email e password');
      return;
    }

    try {
      //prova a chiamare l'endpoint con i dati del nuovo utente
      //creiamo l'header, un record con (key,value) con 2 stringhe,
      //il primo valore è content-type,
      //il secondo è authorization se abbiamo un token, altrimenti non c'è
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `${token}`;
        //headers sarà { 'Content-Type': 'application/json', 'Authorization': '<token>' }
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          isAdmin: newUserIsAdmin,
        }),
      });

      //prende la risposta
      const data = await res.json();

      //risposta non ok, errore
      if (!res.ok) {
        setUserMessageType('error');
        setUserMessage(data?.error || 'Errore durante la creazione utente');
        return;
      }

      //risposta ok, successo
      setUserMessageType('success');
      setUserMessage('Utente creato con successo');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserIsAdmin(false);

      //dopo 1 secondo chiudi il form
      setTimeout(() => {
        setShowAddUser(false);
        setUserMessage('');
      }, 1000);
    } catch (error) {
      console.log("Errore: ", error);
      setUserMessageType('error');
      setUserMessage('Errore di rete durante la creazione utente');
    }
  };

  //states per gestione di visibilità e creazione issue
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [newIssueTitolo, setNewIssueTitolo] = useState('');
  const [newIssueDescrizione, setNewIssueDescrizione] = useState('');
  const [newIssueTipo, setNewIssueTipo] = useState('bug');
  //const [newIssueStato, setNewIssueStato] = useState('todo'); non serve, sempre todo
  const [newIssuePriority, setNewIssuePriority] = useState(0);
  const [newIssueImageurl, setNewIssueImageurl] = useState('');
  const [newIssueEtichette, setNewIssueEtichette] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [issueMessageType, setIssueMessageType] = useState<'success' | 'error'>('success');

  //states per cambio stato issue (solo admin)
  const [changeStateIssueId, setChangeStateIssueId] = useState<number | ''>('');
  const [changeStateStatus, setChangeStateStatus] = useState<'todo' | 'inprogress' | 'done'>('todo');
  const [changeStateMessage, setChangeStateMessage] = useState('');
  const [changeStateMessageType, setChangeStateMessageType] = useState<'success' | 'error'>('success');

  //crea nuova issue, chiama endpoint /api/issues con POST
  const handleAddIssueSubmit = async () => {
    setIssueMessage('');

    if (!newIssueTitolo || !newIssueDescrizione || !newIssueTipo) {
      setIssueMessageType('error');
      setIssueMessage(`Titolo, descrizione e tipo sono richiesti: ${newIssueTitolo}, ${newIssueDescrizione}, ${newIssueTipo}`);
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `${token}`;
      }

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          titolo: newIssueTitolo,
          descrizione: newIssueDescrizione,
          tipo: newIssueTipo,
          stato: 'todo',
          priority: newIssuePriority,
          imageurl: newIssueImageurl || null,
          etichette: newIssueEtichette
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIssueMessageType('error');
        setIssueMessage(data?.error || 'Errore durante la creazione issue');
        return;
      }

      //resetta le react state
      setIssueMessageType('success');
      setIssueMessage('Issue creata con successo');
      setNewIssueTitolo('');
      setNewIssueDescrizione('');
      setNewIssueTipo('bug');
      setNewIssuePriority(0);
      setNewIssueImageurl('');
      setNewIssueEtichette('');

      // ricarica le issue
      loadIssues();

      setTimeout(() => {
        setShowAddIssue(false);
        setIssueMessage('');
      }, 1000);
    } catch (error) {
      console.log("Errore: ", error);
      setIssueMessageType('error');
      setIssueMessage('Errore durante la creazione issue');
    }
  };

  //handleChange chiama /api/issue con POST
  const handleChangeIssueState = async () => {
    setChangeStateMessage('');

    //no ID, errore
    if (!changeStateIssueId) {
      setChangeStateMessageType('error');
      setChangeStateMessage('Seleziona un ID issue valido');
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `${token}`;
      }

      //chiamata all'endpoint con issueId e stato
      const res = await fetch('/api/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({ issueid: changeStateIssueId, stato: changeStateStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChangeStateMessageType('error');
        setChangeStateMessage(data?.error || 'Errore durante il cambio di stato');
        return;
      }

      setChangeStateMessageType('success');
      setChangeStateMessage('Stato cambiato con successo');
      setChangeStateIssueId('');
      setChangeStateStatus('todo');

      loadIssues();
    } catch (error) {
      console.log('Errore: ', error);
      setChangeStateMessageType('error');
      setChangeStateMessage('Errore durante il cambio di stato');
    }
  };

  //funzione per esportazione in csv
  const exportCsv = () => {
    //definisce le colonne
    const headers = ['issueid', 'titolo', 'descrizione', 'tipo', 'stato', 'priority', 'imageurl', 'etichette'];
    //definisce le righe in base a quello che vede l'utente a schermo dopo un eventuale filtrazione
    const rows = filteredIssues.map((issue) => [
      issue.issueid,
      issue.titolo,
      issue.descrizione,
      issue.tipo,
      issue.stato,
      issue.priority,
      issue.imageurl,
      issue.etichette?.join(', ') ?? '', //unisce tutte le etichette in una stringa
    ]);

    //crea contenuto CSV, ogni cella ha le virgolette, e ogni riga è separata da un newline
    //come si legge? ad ogni riga applico map, a ogni cella applico un'altra map separandotutto con virgole
    const csvContent = [headers, ...rows]
      .map((row) => row.map(
        (cell) => `"${String(cell)}"`).join(',')).join('\n');

    //blob, ovvero un file virtuale con csvContent specificando che sia file testuale
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    //crea un link (<a> con href=url del blob) per scaricare il file, clicca e poi rimuovi il link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'issues.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  //note sull'html, rem è un valore di tailwindCss (che react con nodejs usa di base)
  //le 2 opzioni di filtro sono inserite tramite 2 map come già detto prima

  //sono molti check per vedere se far visualizzare o no delle sezioni di dashboard
  //alcune volte usiamo stili speciali (magari per tenere i bottoni in una certa area dello schermo)
  //position sticky ci permette di vedere i 3 bottoni principali ovunque
  return (
    <main style={{maxWidth: '1000px', position: 'relative'}}>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem'}}>
        <button type="button" onClick={onLogout} style={{ position: 'sticky', padding: '0.5rem 1rem'}}>
              🚪 | Logout
        </button>
      </div>
      <h1 style={ {fontSize: '150%'} }><strong>Dashboard</strong></h1>
      <div>
        <h2><strong>Lista issues</strong></h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" onClick={() => setAppliedFilters({ tipo: filterTipo, stato: filterStato }) } style={{ padding: '0.4rem 0.75rem' }}>
            🔍 | Filtra
          </button>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
            <option value="">Tutte le tipologie</option>
            {tipi.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={filterStato} onChange={(e) => setFilterStato(e.target.value)}>
            <option value="">Tutti gli stati</option>
            {stati.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          
          
          {!isGuest && (
            <>
              <div style={{ width: '1000px' }}></div>
              <button type="button" onClick={handleChangeIssueState} style={{ padding: '0.4rem 0.75rem' }}>
                🔧 | Cambia stato
              </button>
              <select value={changeStateIssueId} onChange={(e) => setChangeStateIssueId(Number(e.target.value) || '')} style={{ padding: '0.4rem 0.75rem' }}>
                <option value="">Seleziona issue</option>
                {issues.map((issue) => (
                  <option key={issue.issueid} value={issue.issueid}>
                    {issue.issueid}
                  </option>
                ))}
              </select>
              
              <select value={changeStateStatus} onChange={(e) => setChangeStateStatus(e.target.value as any)} style={{ padding: '0.4rem 0.75rem' }}>
                <option value="todo">todo</option>
                <option value="inprogress">inprogress</option>
                <option value="done">done</option>
              </select>
              
            </>
          )}
          <button type="button" onClick={exportCsv} style={{ padding: '0.4rem 0.75rem' }}>
            Esporta CSV
          </button>
        </div>
        {!isGuest && changeStateMessage && (
          <p style={{ color: changeStateMessageType === 'error' ? 'red' : 'green', marginTop: '0.5rem' }}>
            {changeStateMessage}
          </p>
        )}
      </div>

      {loading && <p>Loading issues…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div className="issues-list">
          {filteredIssues.map((issue) => (
            <div key={issue.issueid} className="issue-card">
              <h2><strong>{issue.titolo}</strong></h2>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>ID:</strong> {issue.issueid}<br/>
              </p>
              <p>{issue.descrizione}</p>
              <p>
                <strong>Priorità:</strong> {issue.priority}<br />
                <strong>Stato:</strong> {issue.stato}<br />
                <strong>Tipo:</strong> {issue.tipo}<br/>
                {issue.etichette && issue.etichette.length > 0 && (
                  <>
                    <strong>Etichette:</strong> {issue.etichette.join(', ')}
                  </>
                )}<br/>
                <strong>Immagine:</strong> {issue.imageurl ? 
                <a href={issue.imageurl} style={{"color": "blue", "textDecoration": "underline"}} target="_blank">Link</a> : 'Nessuna immagine'}
              </p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '1rem'}}>
          <button type="button" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowAddUser(true)}>
            👤 | Aggiungi utente
          </button>
        </div>
      )}

      {!isGuest && (
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem'}}>
          <button type="button" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowAddIssue(true)}>
            🔖 | Aggiungi issue
          </button>
        </div>
      )}

      {showAddUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.3)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '320px', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}>
            <h2 style={{ marginTop: 0 }}>Aggiungi utente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3>Email</h3>
              <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}/>
              <h3>Password</h3>
              <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)}/>
              <h3>Account admin</h3>
              <input type="checkbox" checked={newUserIsAdmin} onChange={(e) => setNewUserIsAdmin(e.target.checked)} />

              {userMessage && <p style={{ color: userMessageType === 'error' ? 'red' : 'green', margin: 0 }}>{userMessage}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddUser(false)} style={{ position: 'sticky', padding: '0.5rem 0.75rem' }}>
                  Annulla
                </button>
                <button type="button" onClick={handleAddUserSubmit} style={{ position: 'sticky', padding: '0.5rem 0.75rem' }}>
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddIssue && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '360px', boxShadow: '0 10px 20px rgb(0, 0, 0)' }}>
            <h2 style={{ marginTop: 0 }}>Aggiungi issue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3>Titolo</h3>
              <input type="text" value={newIssueTitolo} onChange={(e) => setNewIssueTitolo(e.target.value)} />
              <h3>Descrizione</h3>
              <textarea style={{border: '1px solid black'}} value={newIssueDescrizione} rows={3} onChange={(e) => setNewIssueDescrizione(e.target.value)} />
              <h3>Tipo</h3>
              <select value={newIssueTipo} onChange={(e) => setNewIssueTipo(e.target.value)}>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="question">Question</option>
                <option value="documentation">Documentation</option>
              </select>
              <h3>Priorità</h3>
              <input type="number" value={newIssuePriority} onChange={(e) => setNewIssuePriority(Number(e.target.value))} />
              <h3>Image URL (opzionale)</h3>
              <input type="text" value={newIssueImageurl} onChange={(e) => setNewIssueImageurl(e.target.value)} />
              <h3>Etichette (separate da virgole) (opzionale)</h3>
              <input type="text" value={newIssueEtichette} onChange={(e) => setNewIssueEtichette(e.target.value)} />

              {issueMessage && <p style={{ color: issueMessageType === 'error' ? 'red' : 'green', margin: 0 }}>{issueMessage}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddIssue(false)} style={{ padding: '0.5rem 0.75rem' }}>
                  Annulla
                </button>
                <button type="button" onClick={handleAddIssueSubmit} style={{ padding: '0.5rem 0.75rem' }}>
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}