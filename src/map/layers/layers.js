var wms_layers = [];


        var lyr_GoogleSatelliteHybride_0 = new ol.layer.Tile({
            'title': 'Google Satellite Hybride',
            'type': 'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
    attributions: ' ',
                url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            })
        });
		

function polystyle_green(feature) {
    return {
        fillColor: 'green',
        weight: 1,
        opacity: 0.3,
        color: 'red',  //Outline color
        fillOpacity: 0.5
    };
}

var format_zone_experimentation = new ol.format.GeoJSON();
var features_zone_experimentation = format_zone_experimentation.readFeatures(json_zone_experimentation, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_zone_experimentation = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_zone_experimentation.addFeatures(features_zone_experimentation);
var lyr_zone_experimentation = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_zone_experimentation, 
                style: style_zone_experimentation,
                interactive: true,
    title: '<img src="styles/legend/ZONE_XP.png" />   ZONE EXPERIMENTALE'
});

var format_Decoupage_urbain = new ol.format.GeoJSON();
var features_Decoupage_urbain = format_Decoupage_urbain.readFeatures(json_Decoupage_urbain, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Decoupage_urbain = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Decoupage_urbain.addFeatures(features_Decoupage_urbain);
var lyr_Decoupage_urbain = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_Decoupage_urbain, 
                style: style_Decoupage_urbain,
                interactive: true,
    title: '<img src="styles/legend/DECOUPE.png" />   DECOUPAGE URBAIN'
});


var format_Batiment_Bordeaux_Bastide_TEC = new ol.format.GeoJSON();
var features_Batiment_Bordeaux_Bastide_TEC = format_Batiment_Bordeaux_Bastide_TEC.readFeatures(json_Batiment_Bordeaux_Bastide_TEC, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Batiment_Bordeaux_Bastide_TEC = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Batiment_Bordeaux_Bastide_TEC.addFeatures(features_Batiment_Bordeaux_Bastide_TEC);
var lyr_Batiment_Bordeaux_Bastide_TEC = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_Batiment_Bordeaux_Bastide_TEC, 
                style: style_Batiment_Bordeaux_Bastide_TEC,
                interactive: true,
    title: '<img src="styles/legend/BDTOPO.png" />   BDTOPO BORDEAUX BASTIDE'
});

var format_buildings_producteur_TOPO = new ol.format.GeoJSON();
var features_buildings_producteur_TOPO = format_buildings_producteur_TOPO.readFeatures(json_buildings_producteur_TOPO, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_buildings_producteur_TOPO = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_buildings_producteur_TOPO.addFeatures(features_buildings_producteur_TOPO);
var lyr_buildings_producteur_TOPO = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_buildings_producteur_TOPO, 
                style: style_buildings_producteur_TOPO,
                interactive: true,
    title: '<img src="styles/legend/SOLAIRE.png" />   BATIMENT PRODUCTEUR TOPO'
});	


var format_BornesVE_Bordeaux_Bastide = new ol.format.GeoJSON();
var features_BornesVE_Bordeaux_Bastide = format_BornesVE_Bordeaux_Bastide.readFeatures(json_BornesVE_Bordeaux_Bastide, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_BornesVE_Bordeaux_Bastide = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_BornesVE_Bordeaux_Bastide.addFeatures(features_BornesVE_Bordeaux_Bastide);
var lyr_BornesVE_Bordeaux_Bastide = new ol.layer.Vector({
                declutter: true,
				source:jsonSource_BornesVE_Bordeaux_Bastide, 
                interactive: true,
    title: '<img src="styles/legend/Enedis_Picto_Vehicules.png" />   BornesVE'
});	


lyr_GoogleSatelliteHybride_0.setVisible(true);
lyr_zone_experimentation.setVisible(false);
lyr_Decoupage_urbain.setVisible(true);
lyr_Batiment_Bordeaux_Bastide_TEC.setVisible(true);
lyr_buildings_producteur_TOPO.setVisible(true);
lyr_BornesVE_Bordeaux_Bastide.setVisible(true);

var layersList = 
[lyr_GoogleSatelliteHybride_0,
lyr_zone_experimentation,
lyr_Decoupage_urbain,
lyr_Batiment_Bordeaux_Bastide_TEC,
lyr_buildings_producteur_TOPO,
lyr_BornesVE_Bordeaux_Bastide];

lyr_Decoupage_urbain.set('fieldAliases', {'gid' : 'gid', 'libelle': 'libelle', 'RES1': 'RES1', 'RES2': 'RES2', 'PRO1':'PRO1', 'PRO2': 'PRO2', 'ENT': 'ENT', 'PROD_F5': 'PROD_F5' , });
lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldAliases', {'ID_numero_batiment' : 'ID_numero_batiment', });
//lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldAliases', {'osm_id' :'osm_id', 'ID_numero_batiment' : 'ID_numero_batiment' , 'ID' : 'ID' , 'NATURE' : 'NATURE' , 'USAGE1' : 'USAGE1', 'USAGE2' : 'USAGE2', 'LEGER' : 'LEGER', 'En service' : 'En service', 'DATE_CREAT' : 'DATE_CREAT', 'DATE_MAJ' : 'DATE_MAJ', 'DATE_APP' : 'DATE_APP' , 'DATE_CONF' : 'DATE_CONF', 'SOURCE' : 'SOURCE' , 'ID_SOURCE' : 'ID_SOURCE', 'PREC_PLANI' : 'PREC_PLANI' , 'PREC_ALTI' : 'PREC_ALTI' , 'NB_LOGTS' : 'NB_LOGTS', 'NB_ETAGES' : 'NB_ETAGES', 'MAT_MURS' : 'MAT_MURS', 'MAT_TOITS' : 'MAT_TOITS', 'HAUTEUR' : 'HAUTEUR' , 'Z_MIN_SOL' : 'Z_MIN_SOL', 'Z_MIN_TOI' : 'Z_MIN_TOI', 'Z_MAX_TOIT' : 'Z_MIN_TOI', 'Z_MAX_SOL' : 'Z_MAX_SOL', 'ORIGIN_BAT' : 'ORIGIN_BAT' , 'APP_FF' : 'APP_FF', }); 
//lyr_Bordeaux_Bastide_buildings.set('fieldAliases', {'osm_id': 'OSM_ID', 'name': 'NAME', "type": 'TYPE', 'x': 'X', "ID_numero_batiment": 'NUMERO_BATIMENT', });

lyr_Decoupage_urbain.set('fieldImages', {'gid' : 'gid', 'libelle': 'libelle', 'RES1': 'RES1', 'RES2': 'RES2', 'PRO1':'PRO1', 'PRO2': 'PRO2', 'ENT': 'ENT', 'PROD_F5': 'PROD_F5' ,  });
lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldImages', {'ID_numero_batiment' : 'TextEdit', }); 

//lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldImages', {'osm_id' :'TextEdit', 'ID_numero_batiment' : 'TextEdit', 'ID' : 'TextEdit' , 'NATURE' : 'TextEdit' , 'USAGE1' : 'TextEdit', 'USAGE2' : 'TextEdit', 'LEGER' : 'TextEdit', 'En service' : 'TextEdit', 'DATE_CREAT' : 'TextEdit', 'DATE_MAJ' : 'TextEdit', 'DATE_APP' : 'TextEdit', 'DATE_CONF' : 'TextEdit', 'SOURCE' : 'TextEdit', 'ID_SOURCE' : 'TextEdit', 'PREC_PLANI' : 'TextEdit' , 'PREC_ALTI' : 'TextEdit', 'NB_LOGTS' : 'TextEdit', 'NB_ETAGES' : 'TextEdit', 'MAT_MURS' : 'TextEdit', 'MAT_TOITS' : 'TextEdit', 'HAUTEUR' : 'TextEdit', 'Z_MIN_SOL' : 'TextEdit', 'Z_MIN_TOI' : 'TextEdit', 'Z_MAX_TOIT' : 'TextEdit', 'Z_MAX_SOL' : 'TextEdit', 'ORIGIN_BAT' : 'TextEdit', 'APP_FF' : 'TextEdit', }); 

lyr_Decoupage_urbain.set('fieldLabels', {'gid' : 'inline label', 'libelle': 'inline label', 'RES1': 'inline label', 'RES2': 'inline label', 'PRO1':'inline label', 'PRO2': 'inline label', 'ENT': 'inline label', 'PROD_F5': 'inline label' , });
lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldLabels', { 'ID_numero_batiment' : 'no label', }) ;
//lyr_Batiment_Bordeaux_Bastide_TEC.set('fieldLabels', {'osm_id' :'no label', 'ID_numero_batiment' : 'no label', 'ID' : 'inline label' , 'NATURE' : 'no label' , 'USAGE1' : 'no label', 'USAGE2' : 'no label', 'LEGER' : 'no label', 'En service' : 'no label', 'DATE_CREAT' : 'no label', 'DATE_MAJ' : 'no label', 'DATE_APP' : 'no label', 'DATE_CONF' : 'no label', 'SOURCE' : 'no label', 'ID_SOURCE' : 'no label', 'PREC_PLANI' : 'no label', 'PREC_ALTI' : 'no label', 'NB_LOGTS' : 'no label', 'NB_ETAGES' : 'no label', 'MAT_MURS' : 'no label', 'MAT_TOITS' : 'no label', 'HAUTEUR' : 'no label', 'Z_MIN_SOL' : 'no label', 'Z_MIN_TOI' : 'no label', 'Z_MAX_TOIT' : 'no label', 'Z_MAX_SOL' : 'no label', 'ORIGIN_BAT' : 'no label', 'APP_FF' : 'no label', }); 
