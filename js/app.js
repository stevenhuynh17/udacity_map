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

            } else {
              stations[i].shouldShow(false);
            }
          }
        } else {
          for(var i = 0; i < stations.length; i++) {
            viewModel.stations()[i].shouldShow(true);
          }
        }
    }
};

// BART AJAX API call
function bartAPI() {
  var info = $.ajax({
    url: "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y",
    dataType: "json",
  }).done(apply);
}

// Applies bindings to utilize the Knockout Framework with StationsViewModel by
// passing down data retreived from the API call
function apply(data) {
  ko.applyBindings(new StationsViewModel(data));
}

// View Model for the list of stations to be displayed
function StationsViewModel(data) {
  var stations = data.root.stations.station;
  this.query = ko.observable("");
  this.stations = ko.observableArray(populateMap(data));
}

// View Model for the individual station
function StationInformation(name, marker, info) {
  this.marker = ko.observable(marker);
  this.shouldShow = ko.observable(true);
  this.name = ko.observable(name);
  this.showInfo = info;
}

// Adds the markers to the Google Maps
function populateMap(data) {
  // Extracting information for each station
  var markers = [];
  var stations = data.root.stations.station;
  var infowindow = new google.maps.InfoWindow();

  // For each station, extract the coordinates to create a new instance
  // of a google map marker
  for(i = 0; i < stations.length; i++) {
    var lat = Number(stations[i].gtfs_latitude);
    var lng = Number(stations[i].gtfs_longitude );
    var title = stations[i].name;

    var marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        animation: google.maps.Animation.DROP,
        title: title
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

  // Makes the marker bounce when clicked
  function toggleBounce(marker) {
    // Stops all markers from bouncing
    for(var i = 0; i < markers.length; i++) {
      var obj = markers[i].marker();
      if(obj.getAnimation() !== null) {
        obj.setAnimation(null);
      }
    }
    // Only allow one marker to bounce at a time
    if(marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  // Displays information of the marker when clicked
  function populateInfoWindow(marker, infowindow) {
    infowindow.close(map, marker);
    infowindow.setContent(marker.title);
    infowindow.open(map, marker);
  }

  return markers;
}
