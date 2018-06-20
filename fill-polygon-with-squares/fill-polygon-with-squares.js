var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  var drawingSource = new ol.source.Vector({wrapX: false});

  var drawingVector = new ol.layer.Vector({
    source: drawingSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255,0,0,1)'
      })
    })
  });
      
  var gridSource = new ol.source.Vector({wrapX: false});
  var gridVector = new ol.layer.Vector({
    source: gridSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0,175,0,0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: 'white'
      })
    })
  })

  var map = new ol.Map({
    layers: [raster, gridVector, drawingVector],
    target: 'map',
    view: new ol.View({
      center: [-11000000, 4600000],
      zoom: 4
    }),
    controls:[]
  });

  var draw = new ol.interaction.Draw({
    source: drawingSource,
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


  draw.on('drawend',function(event){
    drawingSource.clear();
    gridSource.clear();
    var drawnGeometry = event.feature.getGeometry();
    var extent = drawnGeometry.getExtent();
    var ring = [];
    var count = 0;
    var minStep = document.getElementById("oneSquare").value;
    var extentArea = (extent[2] - extent[0]) * (extent[3] - extent[1]);
    var maximumNumberOfSquares = 1000;
    var stepMultiplier = 1;
    while(extentArea / (minStep*stepMultiplier*minStep*stepMultiplier) > maximumNumberOfSquares){
      stepMultiplier *= 10;
    }
    
    for(var x = extent[0]; x <= extent[2]; x+= (minStep*stepMultiplier)){
      for(var y = extent[1]; y <= extent[3]; y+= (minStep*stepMultiplier)){
        var ring= [[
          [x, y],
          [x + (minStep*stepMultiplier), y],
          [x + (minStep*stepMultiplier), y + (minStep*stepMultiplier)],
          [x, y + (minStep*stepMultiplier)],
          [x, y]
        ]];
        
        var polygon = new ol.geom.Polygon(ring);
        if(drawnGeometry.intersectsExtent(polygon.getExtent())){
          var feature = new ol.Feature({name:"grid", geometry: polygon});
          gridSource.addFeature(feature);
          count++;
        }
      }
    }
    
    document.getElementById("multiplier").innerHTML = (stepMultiplier*stepMultiplier) + " x &nbsp;";
    document.getElementById("result").innerHTML = "&nbsp;" + (count * stepMultiplier) + " x &nbsp;";
    console.log(count);
  });
     
  map.addInteraction(draw);
