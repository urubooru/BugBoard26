import postgres from 'postgres';

// semplice classe con metodi statici per gestire la connessione al database con pattern singleton
export class dbConnection {
  static con : postgres.Sql | null = null;

  static getConnection() {
    if(!dbConnection.con) {
      dbConnection.con = postgres(process.env.DATABASE_URL!);
    }
    
    return dbConnection.con;
  }

  static async closeConn(){
    if(dbConnection.con) {
      const tmp = dbConnection.con;
      dbConnection.con = null;
      await tmp.end();
      
    }
  }
}