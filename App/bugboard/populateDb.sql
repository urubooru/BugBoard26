insert into utente(email,pwd,isadmin) values ('root@root', 'rootpwd', true);
insert into issue(issueId, titolo, descrizione, tipo) values (1, 'Giulia', 'G', 'bug');
insert into issue(issueId, titolo, descrizione, tipo) values (2, 'Marco', 'M', 'feature');
insert into etichetta(issue,etichetta) VALUEs (1, 'provaA'), (1,'provaB');