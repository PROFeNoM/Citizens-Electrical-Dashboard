drop database if exists DASHBOARD;
create database DASHBOARD;
\c DASHBOARD;

-- ============================================================
--   Table : PROD_REGION
-- ============================================================
create table PROD_REGION
(
    ID_PROD                serial primary key,
    HORODATAGE             timestamp,
    NB_POINT_INJECTION     int,
    TOTAL_ENERGIE_INJECTEE int
);

-- ============================================================
--   Table : CONSO_INF36_REGION
-- ============================================================
create table CONSO_INF36_REGION
(
    ID_CONSO_INF36         serial primary key,
    HORODATAGE             timestamp,
    PROFIL                 varchar,
    NB_POINT_SOUTIRAGE     int,
    TOTAL_ENERGIE_SOUTIREE int,
    COURBE_MOYENNE         float
);

-- ============================================================
--   Table : CONSO_SUP36_REGION
-- ============================================================
create table CONSO_SUP36_REGION
(
    ID_CONSO_SUP36         serial primary key,
    HORODATAGE             timestamp,
    PROFIL                 varchar,
    NB_POINT_SOUTIRAGE     int,
    TOTAL_ENERGIE_SOUTIREE int,
    COURBE_MOYENNE         float
);