const {Pool} = require("pg");
import * as XLSX from 'xlsx';

// TODO: move to dbUtils ?
interface Credentials {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

interface CorrespondencesDict {
    [Key: string]: string;
}

/**
 * Convert an XLS file to JSON
 * @param pathname Pathname of the XLS file
 */
function XLS2JSON(pathname: string): any[] {
    let workbook: XLSX.WorkBook = XLSX.readFile(pathname, {type: "binary"});

    let first_sheet_name: string = workbook.SheetNames[0];

    let worksheet: XLSX.WorkSheet = workbook.Sheets[first_sheet_name];

    return XLSX.utils.sheet_to_json(worksheet, {raw: true});
}


/**
 * Add a record to a database
 * @param pool Connection to a PostgreSQL database
 * @param tableName Name of the table where the record should be added within the database
 * @param record Data to be added. Keys are the table column's name and values the data to insert
 */
async function addRecordToDb(pool: any, tableName: string, record: any) {
    const tableColumns: string[] = Object.keys(record);

    let query: string = `insert into ${tableName} (`;
    for (const column of tableColumns)
        query += column + ', ';
    query = query.substring(0, query.length - 2);
    query += ') values (';
    for (const column of tableColumns)
        query += `'${record[column]}', `;
    query = query.substring(0, query.length - 2);
    query += ');'

    return pool.query(query);
}

/**
 * Add the content of an XLS file in a specified PostgreSQL database
 * @param credentials Authentication & Database information
 * @param pathname Path of the XLS file
 * @param tableName Target table where the XLS's content should be inserted
 * @param correspondences Correspondences between the XLS file's columns and the datable table's ones
 * @param conditionOnRawRecord
 * @param displayAddedRecord Set to true to keep track of added record
 */
async function addXLSToDb(credentials: Credentials, pathname: string, tableName: string, correspondences: CorrespondencesDict, conditionOnRawRecord: (rawRecord: any) => boolean = (rawRecord: any) => true, displayAddedRecord: boolean = false): Promise<void> {
    let data = XLS2JSON(pathname);

    const pool = new Pool(credentials);

    for (const rawRecord of data) {
        if (!conditionOnRawRecord(rawRecord))
            continue;
        let dbRecord: any = {};
        for (const [key, value] of Object.entries(correspondences)) {
            if (rawRecord[value] != undefined) {
                dbRecord[key] = rawRecord[value]
            } else {
                break;
            }
        }
        if (displayAddedRecord)
            console.log(dbRecord);
        await addRecordToDb(pool, tableName, dbRecord);
    }
}

// TODO: move to dbUtils ?
const credentials: Credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

/*
addXLSToDb(credentials, "../data/conso-inf36-region_2021_T3.xls", "conso_inf36_region",
    {
        "horodatage": "Horodate",
        "profil": "Profil",
        "nb_point_soutirage": "Nb points soutirage",
        "total_energie_soutiree": "Total énergie soutirée (Wh)",
        "courbe_moyenne": "Courbe Moyenne n°1 + n°2 (Wh)"
    });
*/
/*
function conditionOnRawRecorsdF5(rawRecord: any): boolean {
    return rawRecord['Filière de production'] == 'F5 : Solaire';
}

addXLSToDb(credentials, "../data/prod-region_2021_T3.xls", "prod_region",
    {
        "horodatage": "Horodate",
        "nb_point_injection": "Nb points injection",
        "total_energie_injectee": "Total énergie injectée (Wh)"
    }, conditionOnRawRecorsdF5, true);
*/