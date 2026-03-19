drop schema public cascade;
create schema public;

--ALTER DATABASE postgres REFRESH COLLATION VERSION;

create table Utente(
	email varchar(32) PRIMARY KEY,
	pwd varchar(16) NOT NULL,
	isAdmin boolean default FALSE
);

create table Issue(
	issueId int primary key,
	titolo varchar(16) not null,
	descrizione varchar(128) not null,
	tipo varchar(16) not null,
	stato varchar(16) default 'todo',
  priority int not null default 0,
	imageURL varchar(32)
);

create table etichetta(
	issue int,
	etichetta varchar(16),
	foreign key (issue) REFERENCES Issue(issueId) ON DELETE CASCADE ON UPDATE CASCADE
);

