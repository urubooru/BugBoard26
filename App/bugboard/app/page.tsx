'use client';
import { useState } from "react";
import { checkLoginInfo } from "./actions";
import Dashboard from "./dashboard";

import bugboard from './img/bugboard.png';


export default function Home() {
  //stati per la visualizzazione e per il login
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [loginStatus, setLoginStatus] = useState<'pending' | 'success' | 'error' | 'guest' | null>(null);
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //quando submitto il form, controlla le info di login e agisci in base al risultato
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const user = await checkLoginInfo(email, password); 
      if (user) {
        setUser({ email: user.email, isAdmin: Boolean(user.isadmin ?? user.isAdmin) });
        setLoginStatus('success');
        setView('dashboard');
      } else {
        setLoginStatus('error');
      }
    } catch (error) {
      console.log("Errore durante il login:", error);
      setLoginStatus('error');
    }
  };

  //mouseEvent (click su <a>) per entrare coe guest
  const handleGuestLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setUser(null);
    setLoginStatus('guest');
    setView('dashboard');
  };

  //se loggiamo o entriamo come guest mostriamo la dashboard
  if (view === 'dashboard') {
    return <Dashboard user={user} isGuest={loginStatus === 'guest'} />;
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
