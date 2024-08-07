var diskSizesForZoomLevels = [0, 0, 0, 0, 0, 0, 0, 1, 3, 10, 40, 160, 640, 2561, 10241, 40963, 163845, 655370, 2621460, 10485800, 41943120, 167772320, 671089280, 2684356480, 10737424640, 42949693440];
var worldArea = 510072000; //in square km

const vectorSource = new ol.source.Vector({
    wrapX: false
});

const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
});

var extentSource = new ol.source.Vector({wrapX: false});
var extentLayer = new ol.layer.Vector({
  source: extentSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(0,175,0,0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'Red'
    })
  })
})

var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
});

const view = new ol.View({
    projection: 'EPSG:3857',
})

const map = new ol.Map({
    layers: [osmLayer, vectorLayer,extentLayer],
    target: 'olContainer',
    view: view
});

const draw = new ol.interaction.Draw({
    source: vectorSource,
    type: "Polygon",
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,0,0,1)'
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: [255, 0, 0, 0.8]
            })
        }),
    })
});
map.addInteraction(draw);
draw.on('drawstart', function (event) {
    vectorSource.clear();
    extentSource.clear();
});
draw.on('drawend', function (event) {
    var drawnGeometry = event.feature.getGeometry();
    console.log("Drawn geom area: " + Math.round(ol.sphere.getArea(drawnGeometry)/1000000) +"km^2");
    var extent = drawnGeometry.getExtent();
    var extentPoly = ol.geom.Polygon.fromExtent(extent);
    var feature = new ol.Feature({
        name: "extentPoly",
        geometry: extentPoly
    });
    extentSource.addFeature(feature);
    var areaInKmSquare = Math.round(ol.sphere.getArea(extentPoly)/1000000);
    var diskSizeForZoomLevel = diskSizesForZoomLevels[document.getElementById("maxZoom").value];
    var combinations = document.getElementById("paramCombinations").value;
    document.getElementById("area").innerHTML = areaInKmSquare;
    document.getElementById("diskSize").innerHTML = Math.round(areaInKmSquare * diskSizeForZoomLevel * combinations / (worldArea * 1024));

})

var istExtent = new ol.extent.boundingExtent([[25.0, 35.0], [46, 43]]);
istExtent = ol.proj.transformExtent(istExtent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
view.fit(istExtent, map.getSize());
