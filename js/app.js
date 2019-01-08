//Loads up the map with the intial location of the region
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7215546, lng: -122.3028448},
    zoom: 11
  });
  //Ajax call to populate the map with markers of the respective BART stations
  bartAPI();
}

// Custom handlers section where autoSearch does an autocomplete when searching
// for stations
ko.bindingHandlers.autoSearch = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = valueAccessor();
        var query = ko.unwrap(value).toLowerCase();
        var stations = viewModel.stations();
        if(query) {
          for(var i = 0; i < stations.length; i++) {
            var station = stations[i].name().toLowerCase();
            var match = station.substr(0, query.length);

            if(query === match) {
              stations[i].shouldShow(true);
              stations[i].marker().setVisible(true);
            } else {
              stations[i].shouldShow(false);
              stations[i].marker().setVisible(false);
            }
          }
        } else {
          for(var j = 0; j < stations.length; j++) {
            viewModel.stations()[j].shouldShow(true);
            stations[j].marker().setVisible(true);
          }
        }
    }
};

// View Model for the list of stations to be displayed
class StationsViewModel {
  constructor(data) {
    var menu = document.querySelector('#menu');
    var main = document.querySelector('main');
    var drawer = document.querySelector('#drawer');
    var exit = document.querySelector('#exit');
    var stations = data.root.stations.station;

    this.query = ko.observable("");
    this.stations = ko.observableArray(populateMap(data));
  }

  closeSlide() {
    drawer.classList.remove('open');
  }

  openSlide(data, event) {
    drawer.classList.toggle('open');
    event.stopPropagation();
  }
}

// menu.addEventListener('click', function(e) {
//   drawer.classList.toggle('open');
//   e.stopPropagation();
// });

// BART AJAX API call
function bartAPI() {
  var info = $.ajax({
    url: "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y",
    dataType: "json",
  })
  .done(apply)
  .fail(errorHandling);
}

// Error handlers
function errorHandling(err) {
  console.log(err);
  alert("Something went wrong...\n\n" + err.responseText);
}

function mapError() {
  alert("Google Maps failed to load");
}

// Applies bindings to utilize the Knockout Framework with StationsViewModel by
// passing down data retreived from the API call
function apply(data) {
  ko.applyBindings(new StationsViewModel(data));
}

// View Model for the individual station
function StationInformation(name, marker, info) {
  this.marker = ko.observable(marker);
  this.shouldShow = ko.observable(true);
  this.name = ko.observable(name);
  this.showInfo = info;
}

function individualInfo(infowindow, abbr) {
  var url = "http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig=" + abbr + "&key=MW9S-E7SL-26DU-VV8V&json=y";
  $.ajax({
    url: url,
    dataType: "json"
  })
  .done(function(data) {
    var base = data.root.stations.station;
    var stationName = base.name;
    var stationAddress = base.address + "<br>" + base.city + " " + base.zipcode;
    var stationIntro = base.intro["#cdata-section"];
    var stationAttraction = base.attraction["#cdata-section"];
    var stationFood = base.food["#cdata-section"];
    var stationShopping = base.shopping["#cdata-section"];
    console.log(base);
    var content = "<div class=''>" +
      "<div class=''>" +
        "<h5>" + stationName + "</h5>" +
      "</div>" +
      "<div class='card-body'>" +
        "<p class=''>" + stationAddress + "</p>" +
        "<p class='card-text'>" + stationIntro + "</p>" +
        "<div class='d-flex justify-content-around'>" +
          "<a class='marker-icon' href='https://www.yelp.com/search?find_desc=+&ns=1&rpp=10&find_loc=" + stationAddress + "' target='_blank'><img src='img/roller-coaster.svg' width='50' height='50'></a>" +
          "<a class='marker-icon' href='http://www.yelp.com/search?find_desc=Restaurant+&ns=1&rpp=10&find_loc=" + stationAddress + "' target='_blank'><img src='img/food.svg' width='50' height='50'></a>" +
          "<a class='marker-icon' href='http://www.yelp.com/search?find_desc=Shopping+&ns=1&rpp=10&find_loc=" + stationAddress + "' target='_blank'><img src='img/bag.svg' width='50' height='50'></a>" +
        "</div>" +
      "</div>" +
    "</div>";
    infowindow.setContent(content);
  })
  .fail(errorHandling);
}

// Adds the markers to the Google Maps
function populateMap(data) {
  // Extracting information for each station
  var markers = [];
  var stations = data.root.stations.station;
  var infowindow = new google.maps.InfoWindow({
    maxWidth: 250
  });

  // For each station, extract the coordinates to create a new instance
  // of a google map marker
  for(var i = 0; i < stations.length; i++) {
    var lat = Number(stations[i].gtfs_latitude);
    var lng = Number(stations[i].gtfs_longitude );
    var title = stations[i].name;
    var abbr = stations[i].abbr;

    var marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        animation: google.maps.Animation.DROP,
        title: title,
        abbr: abbr
    });

    // Allows the marker to be clicked where it'll bounce and display info
    marker.addListener('click', enableMarkers);
    // Create a new instance of each station that will be stored in an array
    markers.push(new StationInformation(title, marker, connectInfo));
  }

  function enableMarkers() {
    populateInfoWindow(this, infowindow);
    toggleBounce(this);
  }

  // Enables the list of stations to be clicked and interact with the map
  function connectInfo(info) {
    toggleBounce(info.marker());
    populateInfoWindow(info.marker(), infowindow);
  }

  // Stops all markers from bouncing
  function stopBounce(marker) {
    for(var i = 0; i < markers.length; i++) {
      var obj = markers[i].marker();
      if(obj.getAnimation() !== null) {
        obj.setAnimation(null);
      }
    }
  }

  // Makes the marker bounce when clicked
  function toggleBounce(marker) {
    // Stops all markers from bouncing
    stopBounce(marker);
    // Only allow one marker to bounce at a time
    if(marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  // Displays information of the marker when clicked
  function populateInfoWindow(marker, infowindow) {
    infowindow.addListener("closeclick", function() {
      stopBounce(marker);
    });
    infowindow.close(map, marker);
    individualInfo(infowindow, marker.abbr);
    infowindow.open(map, marker);
  }
  return markers;
}
