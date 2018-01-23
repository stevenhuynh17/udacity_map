function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7215546, lng: -122.3028448},
    zoom: 11
  });

  ko.applyBindings(new AppViewModel());
}

function bartAPI() {
  // Array of markers for them to be placed on the map
  var markers = [];
  return $.ajax({
    url: "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y",
    dataType: "json",
    success: function(data) {
      console.log(data);

      // Extracting information for each station
      var stations = data.root.stations.station;
      var infowindow = new google.maps.InfoWindow();

      // For each station, extract the coordinates to create a new instance
      // of a google map marker
      for(i = 0; i < stations.length; i++) {
        var lat = Number(stations[i].gtfs_latitude);
        var lng = Number(stations[i].gtfs_longitude);
        var title = stations[i].name;

        var marker = new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: map,
            title: title
        })

        markers.push(marker);
        marker.addListener('click', function() {
          populateInfoWindow(this, infowindow);
        });
      }

      function populateInfoWindow(marker, infowindow) {
        infowindow.setContent(marker.title)
        infowindow.open(map, marker)
      }
      return data;
    }
  });
}

function SeatReservation(name, initialMeal) {
    var self = this;
    self.name = name;
    self.meal = ko.observable(initialMeal);
}

function AppViewModel() {
  var self = this;

    // // Non-editable catalog data - would come from the server
    // self.availableMeals = [
    //     { mealName: "Standard (sandwich)", price: 0 },
    //     { mealName: "Premium (lobster)", price: 34.95 },
    //     { mealName: "Ultimate (whole zebra)", price: 290 }
    // ];
    //
    // // Editable data
    // self.seats = ko.observableArray([
    //     new SeatReservation("Steve", self.availableMeals[0]),
    //     new SeatReservation("Bert", self.availableMeals[0])
    // ]);
  console.log("Working");
  console.log(bartAPI());
}
