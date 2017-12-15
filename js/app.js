function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.565059, lng: -122.1136119},
    zoom: 11
  });

  var home = {lat: 37.4275, lng: -122.1697}
  var marker = new google.maps.Marker({
    position: home,
    map: map,
    title: "FIRST MARKER!"
  });

  var infowindow = new google.maps.InfoWindow({
    content: 'TESTING'
  });
  marker.addListener('click', function(){
    infowindow.open(map, marker);
  });
}

function AppViewModel() {

}

ko.applyBindings(new AppViewModel());
