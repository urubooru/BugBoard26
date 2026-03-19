#!/bin/sh
# Crea cartella, ricorsivamente rendi di ogni file proprietario postgres
mkdir -p /var/lib/postgresql/data
chown -R postgres:postgres /var/lib/postgresql/data

# sudo permette di eseguire i comandi come utente postgres
# -c esegue un comando, questo comando crea un nuovo database cluster 
# in /var/lib/postgresql/data
sudo -u postgres initdb -D /var/lib/postgresql/data

# Starta il processo di postgres, -w aspetta che il processo sia pronto prima di continuare
sudo -u postgres pg_ctl start -D /var/lib/postgresql/data -w

# Crea un nuovo utente e un nuovo database
sudo -u postgres psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
sudo -u postgres psql -c "CREATE DATABASE postgres OWNER 'myuser';"

# Esegui gli script SQL 
sudo -u postgres psql -U myuser -d postgres -f /app/createTables.sql
sudo -u postgres psql -U myuser -d postgres -f /app/populateDb.sql

# Start the app
npm run start