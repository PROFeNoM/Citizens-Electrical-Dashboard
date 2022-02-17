-- Making sure roles can't do anything on the database without explicit grant
revoke create on schema PUBLIC from public;
revoke all on database DASHBOARD from public;
\c DASHBOARD;

-- Read-write
create role READ_WRITE;

grant connect on database DASHBOARD to READ_WRITE;
grant usage, create on schema PUBLIC to READ_WRITE;

grant select, insert, update, delete on all tables in schema PUBLIC to READ_WRITE;
alter default privileges in schema PUBLIC grant select, insert, update, delete on tables to READ_WRITE;

grant usage on all sequences in schema PUBLIC to READ_WRITE;
alter default privileges in schema PUBLIC grant usage on sequences to READ_WRITE;

-- Read-only
create role READ_ONLY;

grant connect on database DASHBOARD to READ_ONLY;
grant usage on schema PUBLIC to READ_ONLY;

grant select on all tables in schema PUBLIC to READ_ONLY;
alter default privileges for role READ_WRITE in schema PUBLIC grant select on tables to READ_ONLY;

-- Users
create user READ_WRITE_USER with password 'password_1';
grant READ_WRITE to READ_WRITE_USER;

create user READ_ONLY_USER with password 'password_2';
grant READ_ONLY to READ_ONLY_USER;