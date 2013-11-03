var map = null;
var last = 300000;
var mdata = 1;
var miminis_windows = new Array();
var miminis_windows2 = new Array();

function sendTweet() {
    var tweet = $(Tweet).val("");
    navigator.geolocation.getCurrentPosition(function(position) {
        var data = {
            tweet: tweet,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        $.ajax({
            url: "sendTweet",
            type: "POST",
            data: data,
            success: getTweets,
            dataType: "text"
        });


    }, mapError, {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
    });

}

function initMap(position) {
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function mapError() {
    alert("Error");
}

function init() {
    navigator.geolocation.getCurrentPosition(initMap, mapError, {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
    });
}

function getInstagram() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var urlx = encodeURI("searchInstagram?q=miminis&lat=" + position.coords.latitude + "&long=" + position.coords.longitude);
        $.ajax({
            url: urlx,
            type: "GET",
            success: function(data) {
                parseData(data, instagramHandler, miminis_windows2);
            },
            contentType: "charset=utf-8",
            dataType: "json",
            timeout: 20000
        })
    }, mapError, null);
}


function googleHandler(data, oms, miminis_window) {
    data = data.statuses 
    $.each(data, function(i, item) {
        if (item.geo) {
            var position = new google.maps.LatLng(item.geo.coordinates[0], item.geo.coordinates[1]);
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: item.user.name
            });
            var contentString = generateString(item);
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            miminis_window[i] = infowindow;
            google.maps.event.addListener(marker, 'click', function() {
                for (var p = 0; p < miminis_windows2.length; p++) {
                    if (miminis_windows2[p]) miminis_windows2[p].close();
                }
                for (var p = 0; p < miminis_window.length; p++) {
                    if (miminis_window[p]) miminis_window[p].close();
                }
                if (map.getStreetView().getVisible()) {
                    infowindow.open(map.getStreetView(), this);
                } else {
                    infowindow.open(map, this);
                }
            });
            oms.addMarker(marker);
        }
    });
}
function instagramHandler(data, oms, miminis_window) {
    $.each(data, function(i, item) {
        if (item) {
            var position = new google.maps.LatLng(item.location.latitude, item.location.longitude);
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: item.location.name
            });
	    iconFile = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; 
	marker.setIcon(iconFile) 
            var contentString = generateStringInstagram(item);
            var infowindow = new google.maps.InfoWindow({
                content: contentString,
            });
            miminis_window[i] = infowindow;
            google.maps.event.addListener(marker, 'click', function() {
                for (var p = 0; p < miminis_windows.length; p++) {
                    if (miminis_windows[p]) miminis_windows[p].close();
                }
                for (var p = 0; p < miminis_window.length; p++) {
                    if (miminis_window[p]) miminis_window[p].close();
                }
                if (map.getStreetView().getVisible()) {
                    infowindow.open(map.getStreetView(), this);
                } else {
                    infowindow.open(map, this);
                }
            });
            oms.addMarker(marker);
        }
    });
}

function parseData(data, mapHandler, windowHandler) {
    mdata = data;
    console.log('fineinshed');
    var oms = new OverlappingMarkerSpiderfier(map);
    var gm = google.maps;
    var iw = new gm.InfoWindow();
    oms.addListener('click', function(marker, event) {
        if (!map.getStreetView().getVisible()) {
            iw.setContent(marker.desc);
            iw.open(map, marker);
        }
    });
    oms.addListener('spiderfy', function(markers) {
        if (!map.getStreetView().getVisible()) {
            iw.close();
        }
    });
    google.maps.event.addListener(map.getStreetView(), 'pano_changed', function() {});
    mapHandler(data, oms, windowHandler); 
}

function getTweets() {
    var tweet = $(Tweet).val();
    navigator.geolocation.getCurrentPosition(function(position) {
        var urlx = encodeURI("search?q=miminis&lat=" + position.coords.latitude + "&long=" + position.coords.longitude);
        $.ajax({
            url: urlx,
            type: "GET",
            success: function(data) {
                parseData(data, googleHandler, miminis_windows);
            },
            contentType: "charset=utf-8",
            dataType: "json",
            timeout: 20000
        })
    }, mapError, null);
}

function generateString(item) {
    //var str = '<img src=\'' + item.user.entities.profile.background + '\'' + '>'
    return ('<table><tr><td><img src=\'' + item.user.profile_image_url + '\'></td><td style=\'max-width:140px; word-wrap:break-word;\'>' + item.text + "<br><a href = \"" + item.url + "\" target=\"_blank\">Go to Tweet</a>" + '</td></tr></table>');
}
function generateStringInstagram(item) {
    //var str = '<img src=\'' + item.user.entities.profile.background + '\'' + '>'
    return ('<table><tr><td><a href=\''+item.url+'\' target=\"_blank\"><img src=\'' + item.img_url.url + '\'></a></td></tr><tr><td style=\'max-width:140px; word-wrap:break-word;\'>'+item.caption+'</td></tr></table>');
}
getTweets();
getInstagram();
