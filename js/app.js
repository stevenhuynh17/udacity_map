function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7215546, lng: -122.3028448},
    zoom: 11
  });
  bartAPI();
}

ko.bindingHandlers.autoSearch = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var query = ko.unwrap(value).toLowerCase();
        var stations = viewModel.stations();


        if(query) {
          for(var i = 0; i < stations.length; i++) {
            var station = viewModel.stations()[i].name().name.toLowerCase();
            var match = station.substr(0, query.length);
            if(query === match) {
              viewModel.stations()[i].shouldShow(true);
            } else {
              viewModel.stations()[i].shouldShow(false);
            }
          }
        } else {
          for(var i = 0; i < stations.length; i++) {
            viewModel.stations()[i].shouldShow(true);
          }
        }
    }
};

function apply(data) {
  ko.applyBindings(new StationsViewModel(data));
  var test = populateMap(data);
}

function bartAPI() {
  var info = $.ajax({
    url: "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y",
    dataType: "json",
  }).done(apply);
}

function StationsViewModel(data) {
  var stations = data.root.stations.station;
  this.query = ko.observable("");
  this.stations = ko.observableArray(createList(stations));
}

//Functions below are good to go

function createList(data) {
  var list =[];
  for(var i = 0; i < data.length; i++) {
    list.push(new StationInformation(data[i]));
  }
  return list;
}

function StationInformation(name) {
  this.shouldShow = ko.observable(true);
  this.name = ko.observable(name);
}

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
    })

    markers.push(marker);
    marker.addListener('click', function() {
      populateInfoWindow(this, infowindow);
      toggleBounce(this);
    });
  }

  function toggleBounce(marker) {
    for(var i = 0; i < markers.length; i++) {
      markers[i].setAnimation(null);
    }

    if(marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  function populateInfoWindow(marker, infowindow) {
    infowindow.close(map, marker);
    infowindow.setContent(marker.title);
    infowindow.open(map, marker);
  }
  return markers;
}

function showInfo(test) {
  var content = 1;
  console.log("TESTING");
  console.log(google.maps.event.trigger(this));
}
