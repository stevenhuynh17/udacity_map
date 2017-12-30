function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.565059, lng: -122.1136119},
    zoom: 11
  });

  var locations = $.ajax({
    // datatype: "json",
    url: "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y",
    success: function(data) {
      var stations = data.root.stations.station;
      var markers = [];
      var infowindow = new google.maps.InfoWindow();

      for(i = 0; i < stations.length; i++) {
        var lat = Number(stations[i].gtfs_latitude);
        console.log(typeof(lat));
        var lng = Number(stations[i].gtfs_longitude);

        var marker = new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: map,
            title: stations[i].name
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
    }
  })
}

function AppViewModel() {

}

ko.applyBindings(new AppViewModel());
