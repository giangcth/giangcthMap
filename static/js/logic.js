// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectUrl="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, coordinate) {

        function circlecolor(mag) {
            if (mag <=1) {

                color ="#00af00";
            }
            else if (mag > 1 && mag <= 2) {

                color ="#00ff5f";
            }
            else if (mag >2 && mag <= 3) {

                color ="#d7ff00";
            }
            else if (mag > 3 && mag <= 4) {

                color ="#ffaf00";
            }
            else if (mag > 4 && mag <= 5) {

                color ="#ff5f00";
            }
            else 
                color = "#ff0000";
            
                return color;
        };

        var markerColors = {
          radius: 4*feature.properties.mag,
          fillColor: circlecolor(feature.properties.mag),
          color: "grey",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return L.circleMarker(coordinate, markerColors);
    }
 
    
    
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

};


function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var satelitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satelite": satelitemap,
    "Outdoors": streetmap,
    "Grayscale": graymap
  };

  // Initialize the layer tectonics we'll be using
  var tectonics = new L.LayerGroup();

  d3.json(tectUrl, function(data) {
      L.geoJSON(data, {
          color: "orange",
          weight: 2
      }).addTo(tectonics);
  });
 
  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Tectonic Plates": tectonics,
    "Earthquakes": earthquakes

  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [graymap, earthquakes, tectonics]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ 
    position: "bottomright",
    x: "75%",
    y: "25%"
});

  legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = ["1-", "1-2", "2-3", "3-4", "4-5", "5+"];
      var colors = ["#00af00", "#00ff5f","#d7ff00", "#ffaf00", "#ff5f00","#ff0000" ];
      var labels = [];

      // Add list of labels:
      var legendInfo = "<h1>Magitude Scale</h1>";

      div.innerHTML = legendInfo;

      limits.forEach(function(limit, index) {
        labels.push(</li>" "<li style=\"background-color: "+  colors[index] + "\"></li>");
      });
  
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";

      return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}


