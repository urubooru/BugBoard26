'use client'
import { useEffect, useState } from 'react';
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

type DashboardProps = {
  user: { email: string; isAdmin: boolean } | null;
  isGuest: boolean;
};

export default function Dashboard({ user, isGuest }: DashboardProps) {
  //react states, hanno un valore e una funzione set di base
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //loadIssues, tramite fetch chiama l'endpoint /api/issues e se va bene abbiamo i nostri issues
  const loadIssues = () => {
    setLoading(true);
    setError(null);

    fetch('/api/issues')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Issue[]) => {
        setIssues(data);
      })
      .catch(() => {
        setError('Impossibile caricare le issue');
      })
      .finally(() => setLoading(false));
  };

  //useEffect esegue la funzione quando viene caricata e si evita di avere errori tipo "caricamento e rendering nello stesso momento"
  useEffect(() => {
    loadIssues();
  }, []);

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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setUserMessageType('error');
      setUserMessage('Errore di rete durante la creazione utente');
    }
  };

  //funzione per esportazione in csv
  const exportCsv = () => {
    //definisce le colonne
    const headers = ['issueid', 'titolo', 'descrizione', 'tipo', 'stato', 'priority', 'etichette'];
    //definisce le righe in base a quello che vede l'utente a schermo dopo un eventuale filtrazione
    const rows = filteredIssues.map((issue) => [
      issue.issueid,
      issue.titolo,
      issue.descrizione,
      issue.tipo,
      issue.stato,
      issue.priority,
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
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  //note sull'html, rem è un valore di tailwindCss (che react con nodejs usa di base)
  //le 2 opzioni di filtro sono inserite tramite 2 map come già detto prima

  //sono molti check per vedere se far visualizzare o no delle sezioni di dashboard
  //alcune volte usiamo stili speciali (magari per tenere i bottoni in una certa area dello schermo)
  return (
    <main>
      <h1 style={ {fontSize: '150%'} }><strong>Dashboard</strong></h1>
      <div>
        <h2><strong>Lista issues</strong></h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          <button type="button" onClick={() => setAppliedFilters({ tipo: filterTipo, stato: filterStato })}>
            Filtra
          </button>
          <button type="button" onClick={exportCsv} style={{ padding: '0.4rem 0.75rem' }}>
            Esporta CSV
          </button>
        </div>
      </div>

      {loading && <p>Loading issues…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div className="issues-list">
          {filteredIssues.map((issue) => (
            <div key={issue.issueid} className="issue-card">
              <h2>{issue.titolo}</h2>
              <p>{issue.descrizione}</p>
              <p>
                <strong>Stato:</strong> {issue.stato}<br />
                <strong>Tipo:</strong> {issue.tipo}<br/>
                <strong>Priority:</strong> {issue.priority}<br/>
                {issue.etichette && issue.etichette.length > 0 && (
                  <>
                    <strong>Etichette:</strong> {issue.etichette.join(', ')}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '1rem'}}>
          <button type="button" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowAddUser(true)}>
            Aggiungi utente
          </button>
        </div>
      )}

      {!isGuest && (
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem'}}>
          <button type="button" style={{ padding: '0.5rem 1rem' }} onClick={() => alert('Aggiungi issue')}>
            Aggiungi issue
          </button>
        </div>
      )}

      {showAddUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '320px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
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
                <button type="button" onClick={() => setShowAddUser(false)} style={{ padding: '0.5rem 0.75rem' }}>
                  Annulla
                </button>
                <button type="button" onClick={handleAddUserSubmit} style={{ padding: '0.5rem 0.75rem' }}>
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