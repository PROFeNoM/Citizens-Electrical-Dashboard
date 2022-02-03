const {Pool, Client} = require("pg");
import * as XLSX from 'xlsx';

const credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

function XLS2JSON(pathname: string) {
    let workbook = XLSX.readFile(pathname, {type: "binary"});

    let first_sheet_name = workbook.SheetNames[0];

    let worksheet = workbook.Sheets[first_sheet_name];

    return XLSX.utils.sheet_to_json(worksheet, {raw: true});
}

async function addRecordToDb(pool: any, tableName: string, record: any) {
    const tableColumns: string[] = Object.keys(record);

    let query = `insert into ${tableName} (`;
    for (const column of tableColumns)
        query += column + ', ';
    query = query.substring(0, query.length - 2);
    query += ') values (';
    for (const column of tableColumns)
        query += `'${record[column]}', `;
    query = query.substring(0, query.length - 2);
    query += ');'

    console.log(query);
    return pool.query(query);
}

async function addXLSToDb(pathname: string, tableName: string, correspondances: any) {
    let data = XLS2JSON(pathname);

    const pool = new Pool(credentials);

    for (const rawRecord of data) {
        let dbRecord: any = {};
        for (const [key, value] of Object.entries(correspondances)) {
            // @ts-ignore
            if (rawRecord[value] != undefined) {
                // @ts-ignore
                dbRecord[key] = rawRecord[value]
            } else {
                break;
            }
        }
        console.log(dbRecord);
        await addRecordToDb(pool, tableName, dbRecord);

    }
}

addXLSToDb("../data/conso-inf36-region_2021_T3.xls",
    "conso_inf36_region",
    {
        "horodatage": "Horodate",
        "profil": "Profil",
        "nb_point_soutirage": "Nb points soutirage",
        "total_energie_soutiree": "Total énergie soutirée (Wh)",
        "courbe_moyenne": "Courbe Moyenne n°1 + n°2 (Wh)"
    });

