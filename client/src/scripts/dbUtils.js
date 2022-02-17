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
var turf = require("@turf/turf");
var json_Decoupage_urbain = require("../map/layers/Decoupage_urbain").json_Decoupage_urbain;
var json_eclairage_public_features = require("../map/bor_ptlum").json_eclairage_public_features;
var Building;
(function (Building) {
    Building[Building["Residential"] = 0] = "Residential";
    Building[Building["Professional"] = 1] = "Professional";
    Building[Building["Tertiary"] = 2] = "Tertiary";
    Building[Building["Lighting"] = 3] = "Lighting";
    Building[Building["Producer"] = 4] = "Producer";
    Building[Building["All"] = 5] = "All";
    Building[Building["Residential1"] = 6] = "Residential1";
    Building[Building["Residential2"] = 7] = "Residential2";
    Building[Building["Professional1"] = 8] = "Professional1";
    Building[Building["Professional2"] = 9] = "Professional2";
})(Building = exports.Building || (exports.Building = {}));
/**
 * Return the features section of an urban zone
 * @param urbanZone Urban Zone for which the feature section shall be returned
 * @param json JSON to search from
 */
function getUrbanZoneFeatures(urbanZone, json) {
    return json.features.filter(function (data) { return data.properties.libelle === urbanZone; })[0];
}
/**
 * Return the number of buildings in an urban zone
 * @param urbanZone Urban zone to search into
 * @param buildingType Building type searched
 */
function getUrbanZoneNumberOfBuildings(urbanZone, buildingType) {
    var data = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);
    if (data) {
        var dataProperties = data.properties;
        switch (buildingType) {
            case Building.Residential:
                return dataProperties.RES1 + dataProperties.RES2;
            case Building.Residential1:
                return dataProperties.RES1;
            case Building.Residential2:
                return dataProperties.RES2;
            case Building.Professional:
                return dataProperties.PRO1 + dataProperties.PRO2;
            case Building.Professional1:
                return dataProperties.PRO1;
            case Building.Professional2:
                return dataProperties.PRO2;
            case Building.Tertiary:
                return dataProperties.ENT;
            case Building.Lighting:
                var searchWithin_1 = turf.polygon(data.geometry.coordinates[0]);
                var ptsWithin = json_eclairage_public_features.filter(function (feature) { return turf.booleanWithin(turf.point(feature.geometry.coordinates), searchWithin_1); });
                return ptsWithin.length;
            case Building.Producer:
                return dataProperties.PROD_F5;
        }
    }
    return 0;
}
exports.getUrbanZoneNumberOfBuildings = getUrbanZoneNumberOfBuildings;
/**
 * Return the area in square meters of the urban zone
 * @param urbanZone Urban zone for which the area should be computed
 */
function getUrbanZoneArea(urbanZone) {
    var data = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);
    if (data)
        return turf.area(turf.polygon(data.geometry.coordinates[0]));
    else
        return 0;
}
exports.getUrbanZoneArea = getUrbanZoneArea;
/**
 * Return the number of buildings in La Bastide
 * @param buildingType
 */
function getDistrictNumberOfBuildings(buildingType) {
    return json_Decoupage_urbain.features.reduce(function (prev, curr) { return prev + getUrbanZoneNumberOfBuildings(curr.properties.libelle, buildingType); }, 0);
}
exports.getDistrictNumberOfBuildings = getDistrictNumberOfBuildings;
/**
 * Return the area of La Bastide
 */
function getDistrictArea() {
    return json_Decoupage_urbain.features.reduce(function (prev, curr) { return prev + getUrbanZoneArea(curr.properties.libelle); }, 0);
}
exports.getDistrictArea = getDistrictArea;
function runQuery(queryLink) {
    return __awaiter(this, void 0, void 0, function () {
        var response, err_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("http://localhost:5000/" + queryLink)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_1 = _a.sent();
                    error = err_1;
                    console.error(error.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Return the consumption of electricity for a given urban zone in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param urbanZone Urban zone of the buildings
 * @param t2 Timestamp of the end of the time period
 */
function getUrbanZoneElectricityConsumption(t1, buildingType, urbanZone, t2) {
    return __awaiter(this, void 0, void 0, function () {
        function _addQuery(profile, t1, t2) {
            queries.push("urbanZoneElectricityConsumption?profile=RES1&t1='" + t1 + "'" + (t2 ? "&t2='" + t2 + "'" : ''));
        }
        var queries, weights, resultWh, i, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queries = [];
                    weights = [];
                    switch (buildingType) {
                        case Building.Residential:
                            _addQuery("RES1", t1, t2);
                            _addQuery("RES2", t1, t2);
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential1); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential2); });
                            break;
                        case Building.Professional:
                            _addQuery("PRO1", t1, t2);
                            _addQuery("PRO2", t1, t2);
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional1); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional2); });
                            break;
                        case Building.Tertiary:
                            queries.push("urbanZoneElectricityConsumptionTertiary?t1='" + t1 + "'" + (t2 ? "&t2='" + t2 + "'" : ''));
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary); });
                            break;
                        case Building.Lighting:
                            _addQuery("PRO5", t1, t2);
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting); });
                            break;
                        case Building.All:
                            _addQuery("RES1", t1, t2);
                            _addQuery("RES2", t1, t2);
                            _addQuery("PRO1", t1, t2);
                            _addQuery("PRO2", t1, t2);
                            queries.push("urbanZoneElectricityConsumptionTertiary?t1='" + t1 + "'" + (t2 ? "&t2='" + t2 + "'" : ''));
                            _addQuery("PRO5", t1, t2);
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential1); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential2); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional1); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional2); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary); });
                            weights.push(function () { return getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting); });
                            break;
                    }
                    resultWh = 0;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < queries.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, runQuery(queries[i])];
                case 2:
                    res = _a.sent();
                    resultWh += res[0].courbe_moyenne * weights[i]();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, resultWh];
            }
        });
    });
}
exports.getUrbanZoneElectricityConsumption = getUrbanZoneElectricityConsumption;
function getDistrictElectricityConsumption(t1, buildingType, t2) {
    return __awaiter(this, void 0, void 0, function () {
        var consumptions;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(json_Decoupage_urbain.features
                        .map(function (feature) { return feature.properties.libelle; })
                        .map(function (urbanZone) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getUrbanZoneElectricityConsumption(t1, buildingType, urbanZone, t2)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }))];
                case 1:
                    consumptions = _a.sent();
                    return [2 /*return*/, consumptions.reduce(function (prev, curr) { return prev + curr; }, 0)];
            }
        });
    });
}
exports.getDistrictElectricityConsumption = getDistrictElectricityConsumption;
function getUrbanZoneElectricityProduction(t1, urbanZone, t2) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runQuery("urbanZoneElectricityProduction?t1='" + t1 + "'" + (t2 ? "&t2='" + t2 + "'" : ''))];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res[0].moyenne * getUrbanZoneNumberOfBuildings(urbanZone, Building.Producer)];
            }
        });
    });
}
exports.getUrbanZoneElectricityProduction = getUrbanZoneElectricityProduction;
function getDistrictElectricityProduction(t1, t2) {
    return __awaiter(this, void 0, void 0, function () {
        var consumptions;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(json_Decoupage_urbain.features
                        .map(function (feature) { return feature.properties.libelle; })
                        .map(function (urbanZone) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getUrbanZoneElectricityProduction(t1, urbanZone, t2)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }))];
                case 1:
                    consumptions = _a.sent();
                    return [2 /*return*/, consumptions.reduce(function (prev, curr) { return prev + curr; }, 0)];
            }
        });
    });
}
exports.getDistrictElectricityProduction = getDistrictElectricityProduction;
function getUrbanZoneSelfConsumptionRatio(t1, urbanZone, t2) {
    return __awaiter(this, void 0, void 0, function () {
        var prod, cons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUrbanZoneElectricityProduction(t1, urbanZone, t2)];
                case 1:
                    prod = _a.sent();
                    return [4 /*yield*/, getUrbanZoneElectricityConsumption(t1, Building.All, urbanZone, t2)];
                case 2:
                    cons = _a.sent();
                    return [2 /*return*/, prod / cons];
            }
        });
    });
}
exports.getUrbanZoneSelfConsumptionRatio = getUrbanZoneSelfConsumptionRatio;
function getDistrictSelfConsumption(t1, t2) {
    return __awaiter(this, void 0, void 0, function () {
        var prod, cons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDistrictElectricityProduction(t1, t2)];
                case 1:
                    prod = _a.sent();
                    return [4 /*yield*/, getDistrictElectricityConsumption(t1, Building.All, t2)];
                case 2:
                    cons = _a.sent();
                    return [2 /*return*/, prod / cons];
            }
        });
    });
}
exports.getDistrictSelfConsumption = getDistrictSelfConsumption;
