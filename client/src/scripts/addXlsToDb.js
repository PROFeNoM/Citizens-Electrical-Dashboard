"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var XLSX = require("xlsx");
var Pool = require("pg").Pool;
/**
 * Convert an XLS file to JSON
 * @param pathname Pathname of the XLS file
 */
function XLS2JSON(pathname) {
    var workbook = XLSX.readFile(pathname, { type: "binary" });
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    return XLSX.utils.sheet_to_json(worksheet, { raw: true });
}
/**
 * Add a record to a database
 * @param pool Connection to a PostgreSQL database
 * @param tableName Name of the table where the record should be added within the database
 * @param record Data to be added. Keys are the table column's name and values the data to insert
 */
function addRecordToDb(pool, tableName, record) {
    return __awaiter(this, void 0, void 0, function () {
        var tableColumns, query, _i, tableColumns_1, column, _a, tableColumns_2, column;
        return __generator(this, function (_b) {
            tableColumns = Object.keys(record);
            query = "insert into " + tableName + " (";
            for (_i = 0, tableColumns_1 = tableColumns; _i < tableColumns_1.length; _i++) {
                column = tableColumns_1[_i];
                query += column + ', ';
            }
            query = query.substring(0, query.length - 2);
            query += ') values (';
            for (_a = 0, tableColumns_2 = tableColumns; _a < tableColumns_2.length; _a++) {
                column = tableColumns_2[_a];
                query += "'" + record[column] + "', ";
            }
            query = query.substring(0, query.length - 2);
            query += ');';
            return [2 /*return*/, pool.query(query)];
        });
    });
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
function addXLSToDb(credentials, pathname, tableName, correspondences, conditionOnRawRecord, displayAddedRecord) {
    if (conditionOnRawRecord === void 0) { conditionOnRawRecord = function (rawRecord) { return true; }; }
    if (displayAddedRecord === void 0) { displayAddedRecord = false; }
    return __awaiter(this, void 0, void 0, function () {
        var data, pool, _i, data_1, rawRecord, dbRecord, _a, _b, _c, key, value;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    data = XLS2JSON(pathname);
                    pool = new Pool(credentials);
                    _i = 0, data_1 = data;
                    _d.label = 1;
                case 1:
                    if (!(_i < data_1.length)) return [3 /*break*/, 4];
                    rawRecord = data_1[_i];
                    if (!conditionOnRawRecord(rawRecord))
                        return [3 /*break*/, 3];
                    dbRecord = {};
                    for (_a = 0, _b = Object.entries(correspondences); _a < _b.length; _a++) {
                        _c = _b[_a], key = _c[0], value = _c[1];
                        if (rawRecord[value] !== undefined) {
                            dbRecord[key] = rawRecord[value];
                        }
                        else {
                            break;
                        }
                    }
                    if (displayAddedRecord)
                        console.log(dbRecord);
                    return [4 /*yield*/, addRecordToDb(pool, tableName, dbRecord)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// TODO: move to dbUtils ?
var credentials = {
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
addXLSToDb(credentials, "../data/conso-sup36-region_2021_T3.xls", "conso_sup36_region",
    {
        "horodatage": "Horodate",
        "profil": "Profil",
        "nb_point_soutirage": "Nb points soutirage",
        "total_energie_soutiree": "Total énergie soutirée (Wh)",
        "courbe_moyenne": "Courbe Moyenne n°1 + n°2 (Wh)"
    }, (rawRecord: any) => true, true);
*/
/*
addXLSToDb(credentials, "../data/conso-sup36-region_2021_T4.xls", "conso_sup36_region",
    {
        "horodatage": "Horodate",
        "profil": "Profil",
        "nb_point_soutirage": "Nb points soutirage",
        "total_energie_soutiree": "Total énergie soutirée (Wh)",
        "courbe_moyenne": "Courbe Moyenne n°1 + n°2 (Wh)"
    }, (rawRecord: any) => new Date(rawRecord['Horodate']) > new Date('2021-09-30 23:30:00+02:00'), true);
*/
/*
function conditionOnRawRecorsdF5(rawRecord: any): boolean {
    return rawRecord['Filière de production'] === 'F5 : Solaire';
}

addXLSToDb(credentials, "../data/prod-region_2021_T3.xls", "prod_region",
    {
        "horodatage": "Horodate",
        "nb_point_injection": "Nb points injection",
        "total_energie_injectee": "Total énergie injectée (Wh)"
    }, conditionOnRawRecorsdF5, true);
*/
function conditionOnRawRecorsdF5b(rawRecord) {
    return rawRecord['Filière de production'] === 'F5 : Solaire' && new Date(rawRecord['Horodate']) > new Date('2021-09-30 23:30:00+02:00');
}
addXLSToDb(credentials, "../data/prod-region_2021_T4.xls", "prod_region", {
    "horodatage": "Horodate",
    "nb_point_injection": "Nb points injection",
    "total_energie_injectee": "Total énergie injectée (Wh)"
}, conditionOnRawRecorsdF5b, true);
