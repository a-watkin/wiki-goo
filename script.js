var map;
var url;
var markers = [];
var boundsArray = [];
var addressBlurb = "The google goecache service has returned the address: " + "<br>";
var circles = [];
var numberOfResults = 20;
var searchRadius = 1000;
var disaplyMarkers = true;
var address;
var clickSearch = true;
var geocoder;


// helper methods for the toggle button used for walking
// distances
function toggleOff() {
  $('#walking-Circle').bootstrapToggle('off')  
}

function toggleEnable() {
  $('#walking-Circle').bootstrapToggle('enable');
}

function toggleDisable() {
  $('#walking-Circle').bootstrapToggle('disable');
}

$(document).ready(function(){
  // initialise the toggle buttons
  $('#markers').bootstrapToggle('on');
  $('#walking-Circle').bootstrapToggle('off');
  $('#markers').bootstrapToggle('disable');
  $('#walking-Circle').bootstrapToggle('disable');
  $('#click-search').bootstrapToggle('off');

  $("#address").keyup(function(event){
    // alert("hello");
    if(event.keyCode == 13){
        $("#submit").click();
    }
  });
});

$(function() {
  $('#markers').change(function() {
    if (disaplyMarkers === true) {
      clearMarkers();
      disaplyMarkers = false;
    }
    else {
      showMarkers();
      disaplyMarkers = true;
    }
  });
});

function initMap() {
  var startUrl = {lat: 52.52000659999999, lng: 13.404953999999975}
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: startUrl,
    scaleControl: true
  });

  geocoder = new google.maps.Geocoder();

  // geocoder service
  document.getElementById('submit').addEventListener('click', function() {
    document.getElementById("returned-address").style.color = "black";
    document.getElementById("returned-address").innerHTML = addressBlurb;
    geocodeAddress(geocoder, map);
  });
}

// experiment click for search
$(function() {
  $('#click-search').change(function() {

    toggleOff();
    // toggleDisable();

    if (clickSearch === true) {
      // alert('testicles on');
      clickSearch = false;
     map.addListener('click', function(event) {
        geocodeAddress(geocoder, map, event.latLng);
        $('#click-search').bootstrapToggle('off');
      });
    }
    else {
      clickSearch = true;
      // so the problem was you didn't unregister the click event listener
      // awesome
      google.maps.event.clearListeners(map, 'click');
    }
  });
});

// toggle walking circles
$(function() {
$('#walking-Circle').change(function() {
    if ($(this).prop('checked') === true) {
      walkingCircle();
    }
    else {
      deleteCircle();
    }
  })
});

function geocodeAddress(geocoder, resultsMap, clickAddress) {
  // remove previous markers if any
  deleteMarkers();
  $('#markers').bootstrapToggle('enable');
  toggleEnable();
  // this is causing a PROBLEM, ok it was just messing up the switch
  // because you forgot to set the boolean
  $('#markers').bootstrapToggle('on');
  disaplyMarkers = true;

  toggleOff();

  // gets the value in the input box
  if (clickSearch === true) {
    address = document.getElementById('address').value;
  }
  else {
    var tempString = String(clickAddress.lat() + ", " + clickAddress.lng());
    // console.log("the stringified thingie is " + tempString);
    address = tempString;
  }

  // actual geocode lookup here
  geocoder.geocode({'address': address}, function(results, status) {
  if (status === 'OK') {
      // sets url to the search result
      url = {lat: results[0].geometry.location.lat(),
             lng: results[0].geometry.location.lng()}

      fullAddress = results[0].formatted_address;
      document.getElementById("returned-address").innerHTML = addressBlurb + fullAddress;

      addMarker(url, true, true);
      getWikiValues();
  }
  else {
    document.getElementById("returned-address").innerHTML = "Address not found.";
    document.getElementById("returned-address").style.color = "red";
  }

  });
}

// so if it's the first marker then pass a value for labelName
// and the addInfoWindow boolean
// 
// markerList is the link and name for the info window
function addMarker(location, labelName, addInfoWindow, markerList) {
  // adds marker location to the bounds object
  // this object is used later to center the map
  boundsArray.push(location);

  // set current location marker label
  // this is for the first marker only
  if (labelName === true) {
    var labelValue = 'A';
  }
  // otherwise set the marker label to increment
  else {
    var labelValue = String(markers.length);
  }

  var marker = new google.maps.Marker({
    position: location,
    map: map,
    label: labelValue,
  });

  if (addInfoWindow === true) {
    contentString = 'You are here.';
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    // i want this to timeout eventually i think
    infowindow.open(map,marker);

    // so you can click on it again later
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

    // closes the window after 5 seconds
    setTimeout(function () { infowindow.close(); }, 5000);
  }
  else {
    contentString = markerList;
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    // event listener to open the above infowindow
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  }
  markers.push(marker);
}

// centres the map on a point and sets the zoom to encapsulate
// all the points on the map
function centreMap() {
  // set the first marker position as the centre of the map
  map.setCenter({lat: markers[0].position.lat(), 
                  lng: markers[0].position.lng()});

  // create the bounds object
  var bounds = new google.maps.LatLngBounds();
  // add values from the array to the bounds object
  for (var i = 0; i < markers.length; i++) {
    bounds.extend(boundsArray[i]);
  }
  // centres based on multiple points in bounds object
  map.fitBounds(bounds);

  // this actually causes a problem
  // prevents zoom from being too high if number of points is low
  if (boundsArray.length === 1) {
    map.setZoom(10);
  }
}

function getWikiValues() {
  var apiUrl = "https://en.wikipedia.org/w/api.php"

  $.ajax({url: apiUrl,
  dataType: 'jsonp',
  jsonp: 'callback',
  data: {action: 'query',
       list: 'geosearch',
       // i assume this is in metres? seems so
       gsradius: 1000,
       gscoord: url.lat + '|' + url.lng,
       gslimit: numberOfResults,
       format: 'json'},
    success: function(response) {
      var baseURL = "https://en.wikipedia.org/?curid="

      document.getElementById("wiki-list").innerHTML = "";

      var bounds = new google.maps.LatLngBounds();

      if (response.query.geosearch.length === 0) {
        document.getElementById("result-header").innerHTML = 
            "No results found.";
      }
      else {
        document.getElementById("result-header").innerHTML = 
            "The following pages for your location were found (clicking on links will open them in a new tab):";
      }


      // iterate over the json object and get various values
      for ( var i = 0; i < response.query.geosearch.length; i++) {
        var counter = i + 1;

        var linkUrl = baseURL + response.query.geosearch[i].pageid;

        nameList = "<ul>" + counter + ": " + "<a href=" + linkUrl + ' ' + "target=" + "_blank" + ">" + response.query.geosearch[i].title + "</a>" + "</ul>";
        document.getElementById("wiki-list").innerHTML += nameList;

        var location = new google.maps.LatLng({lat: response.query.geosearch[i].lat,
                        lng: response.query.geosearch[i].lon});

        var labelValue = String(i + 1);

        var markerPostision = {lat: response.query.geosearch[i].lat,
                        lng: response.query.geosearch[i].lon}

        var markerList = "<a href=" + linkUrl + " " + "target=" + "_blank" + ">" + response.query.geosearch[i].title + "</a>";

        // function addMarker(location, labelName, addInfoWindow, infoWindowLink)
        addMarker(markerPostision, false, false, markerList);
        }
        centreMap();
      }
  });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
  // remove bounds values from boundsArray
  boundsArray = [];
}

// hard coded walking distances
function walkingCircle() {
  addCircle(150, "green");
  addCircle(300, "blue");
  addCircle(600, "purple");
  addCircle(searchRadius, "black");
}

// adds circles to the map of the given radius
function addCircle(value, colour) {

  document.getElementById("walking-key").style.visibility = "visible";

  circle = new google.maps.Circle({
    // this is the colour of the edge
    strokeColor: colour,
    strokeOpacity: 0.8,
    strokeWeight: 2,

    // fillColor: '#ffffff',
    // makes it clear
    fillOpacity: 0.0,
    map: map,
    center: url,
    radius: parseInt(value)
  });
  circles.push(circle);
  // console.log(circles);
}

function deleteCircle() {
  document.getElementById("walking-key").style.visibility = "hidden";

  // iterates over the circles array and sets the map
  // value for each item to null
  for (var i = 0; i < circles.length; i++) {
    // console.log(circles[i])
    circles[i].setMap(null);
  }
  // resets to array to an empty array
  circles = [];
}