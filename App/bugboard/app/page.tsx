'use client';
import { useState } from "react";
import Dashboard from "./dashboard";

import bugboard from './img/bugboard.png';


export default function Home() {
  // funzione per leggere cookie, uso decode per supportare caratteri speciali
  // prende stringa e restituisce stringa o null
  const getCookieValue = (name: string): string | null => {
    //splittiamo il cookie in singoli valori e li trimmiamo, 
    // poi cerchiamo quello che inizia con il nome richiesto
    
    /*
    NOTA: quando logghiamo con un cookie già presente document è undefined,
    ma nonostante ciò funziona tutto as intended e ci ritroviamo su dashboard
    non capisco perché.
    https://stackoverflow.com/questions/35068451/reactjs-document-is-not-defined

    */
   try{
    const match = document.cookie.split(';').map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  } catch {
    return null;
  }
  };

  //funzione che scrive il cookie, nome valore e durata
  const setCookieValue = (name: string, value: string, age = 300): void => {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${age};`;
  };

  // stati per la visualizzazione e per il login
  // inizializza gli stati anche in base alla presenza di un token utente
  const [view, setView] = useState<'login' | 'dashboard'>(() => {
    const storedToken = getCookieValue('bugboard_token');
    const storedUser = getCookieValue('bugboard_user');
    if (!storedToken || !storedUser) return 'login';
    try {
      JSON.parse(storedUser);
      return 'dashboard';
    } catch {
      return 'login';
    }
  });

  const [loginStatus, setLoginStatus] = useState<'pending' | 'success' | 'error' | 'guest' | null>(() => {
    const storedToken = getCookieValue('bugboard_token');
    return storedToken ? 'success' : null;
  });

  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(() => {
    const storedUser = getCookieValue('bugboard_user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return getCookieValue('bugboard_token');
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //quando submitto il form, controlla le info di login e agisci in base al risultato
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    //chiamata endpoint login
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setLoginStatus('error');
        return;
      }

      const user = await res.json();
      const parsedUser = { email: user.email, isAdmin: Boolean(user.isadmin ?? user.isAdmin) };
      setUser(parsedUser);
      setToken(user.token ?? null);
      // codice per memorizzare token e utente in cookie (stessa sintassi usata in getCookieValue)
      setCookieValue('bugboard_token', user.token ?? '');
      setCookieValue('bugboard_user', JSON.stringify(parsedUser));
      setLoginStatus('success');
      setView('dashboard');
    } catch (error) {
      console.log("Errore durante il login:", error);
      setLoginStatus('error');
    }
  };

  //mouseEvent (click su <a>) per entrare coe guest
  const handleGuestLogin = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/guest');
      if (!res.ok) {
        setLoginStatus('error');
        return;
      }
      const data = await res.json();

      const guestUser = { email: data.email, isAdmin: data.isAdmin };
      setUser(guestUser);
      setToken(data.token);
      // creazione cookie per guest, valido per 5 minuti
      setCookieValue('bugboard_token', data.token);
      setCookieValue('bugboard_user', JSON.stringify(guestUser));
      setLoginStatus('guest');
      setView('dashboard');
    } catch (error) {
      console.log('Errore durante il login guest:', error);
      setLoginStatus('error');
    }
  };

  //funzione che esegue logout cancellando token e tornando a login
  const handleLogout = () => {
    // Impostare i cookie a scaduti così il browser li elimina
    setCookieValue('bugboard_token', '', 0);
    setCookieValue('bugboard_user', '', 0);

    setToken(null);
    setUser(null);
    setLoginStatus(null);
    setEmail('');
    setPassword('');
    setView('login');
  };

  //se loggiamo o entriamo come guest mostriamo la dashboard
  if (view === 'dashboard') {
    return <Dashboard user={user} isGuest={loginStatus === 'guest'} token={token} onLogout={handleLogout} />;
  }

  return (
    <main>
        <img src={bugboard.src} style={{width: '400px'}} alt="BugBoard" />
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/> <br/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/> <br />
          <button type="submit">Esegui il login</button><br/>
          <a href="#" onClick={handleGuestLogin}>Entra come guest (modalità read only)</a>
          {loginStatus === 'error' && <h2 style={{ color: 'red' }}>Dati in input sbagliati</h2>}
        </form>
    </main>
  );
}
