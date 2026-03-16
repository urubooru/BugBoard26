import Image from "next/image";

export default function Home() {
  return (
    <main>
        <h1>BugBoard26</h1>
        <form>
          <input type="email" placeholder="Email" /> <br/>
          <input type="password" placeholder="Password" /> <br />
          <button type="submit">Esegui il login</button>
        </form>
    </main>
  );
}
