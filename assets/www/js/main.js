var map;
var geocoder;
var markersArray = [];
var LatLonPosition;
var address = "";
var maptiler;
var style_Dark = [{featureType: 'all',	stylers:[ {hue: '#0000b0'},{invert_lightness: 'true'},{saturation: -30}	]}];
var shortURL = "";
var shareText = "";
var displayLat = "";
var displayLon = "";
var map_switchState = 0;



var MainJS = MainJS || {};
var MainJS = {

	TileUrl: function(coord, zoom) {
		var numTiles = 1 << zoom;
		var wrappedX = coord.x % numTiles;
		wrappedX = wrappedX >= 0 ? wrappedX : wrappedX + numTiles;

		if(zoom<9) {
			return "http://ean.vg/Overlay/"+zoom + "/" + wrappedX + "/" + (Math.pow(2,zoom)-coord.y-1) + ".png"; 
		} else {
			return;
		}
	}, // TileUrl

	initialize: function() {

       		geocoder = new google.maps.Geocoder();
		mapOptions = {
		zoom: 4,
		minZoom: 2,
    		maxZoom: 20,
		center: new google.maps.LatLng(50.208, 14.484),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,

		styles:style_Dark
		}

		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		maptiler = new google.maps.ImageMapType({getTileUrl: MainJS.TileUrl, tileSize: new google.maps.Size(256, 256), isPng: true });
		map.overlayMapTypes.insertAt(0, maptiler);

		google.maps.event.addListener(map, 'zoom_changed', function() {
			if( map_switchState==0) {
				var zoomlevel = map.getZoom();
				if(zoomlevel == 6)  {
					maptiler.setOpacity(1);
				}
				if(zoomlevel == 7)  {
					maptiler.setOpacity(0.4);
				}
				if(zoomlevel == 8)  {
					maptiler.setOpacity(0.3);
				}
			}
		});


	}, // initialize 

	loadmap: function() {

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=MainJS.initialize";
		document.body.appendChild(script);

	}, //loadmap


	codeAddress: function(q_address){

		MainJS.clearOverlays();

		geocoder.geocode( { 'address': q_address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				address = results[0].formatted_address;

				map.setCenter(results[0].geometry.location);

				LatLonPosition = results[0].geometry.location;
				displayLat = MainJS.roundLatLon(LatLonPosition.lat(),5);
				displayLon = MainJS.roundLatLon(LatLonPosition.lng(),5);

				var latlonString = 'lat: ' + displayLat + '  lon:' + displayLon;
				var infowindow = new google.maps.InfoWindow({
					content: '<p>' + address + '</p>' + '<p>' + latlonString + '</p>'
				});


				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location,
					clickable: true

				});


				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map,marker);
				});

				markersArray.push(marker);
				infowindow.open(map,marker);


			} else {
				address = '';
				alert("Unable to find. Check location spelling.");

			}
		});
	},// codeAddress

	clearOverlays: function(){
		if (markersArray) {
			for (i in markersArray) {
				markersArray[i].infoWindow=null;
				markersArray[i].setMap(null);
				markersArray.splice(i, 1);
			}
		}
	}, // clearOverlays


	swtichmap: function(switchstate){
		if(switchstate == 1) {
			map.overlayMapTypes.setAt(0, 0);
			map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			map.setOptions({ 'styles': '' });

		} 
		if(switchstate == 0) {
			map.overlayMapTypes.setAt(0, 0);
			map.overlayMapTypes.insertAt(0, maptiler);
			map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			map.setOptions({ 'styles': style_Dark });

			var zoomlevel = map.getZoom();
			if(zoomlevel == 6)  {
				maptiler.setOpacity(1);
			}
			if(zoomlevel == 7)  {
				maptiler.setOpacity(0.4);
			}
			if(zoomlevel == 8)  {
				maptiler.setOpacity(0.3);
			}
		}
	}, // swtichmap

	Save: function(titleUser, descriptionUser, linkUser, selectAnchor, optionAddress, optionLatLon) {

		var currentDate = new Date();
		var day = currentDate.getDate();
		var month = currentDate.getMonth() + 1;
		var year = currentDate.getFullYear();
		selectAnchor = ""; 
		linkUser = "";

		$.post("http://ean.vg/sb.php", { lat: markersArray[0].position.lat(), lon: markersArray[0].position.lng(), Title: titleUser, Description: descriptionUser, SwitchState: 0, ZoomLevel: map.getZoom(), Link: linkUser, AnchorLink: selectAnchor, optAddress: optionAddress ? 1 : 0, optLatLon: optionLatLon ? 1 : 0, Address: address, UserDate: day + "/" + month + "/" + year }, function(response) {
			if(response!="!ERROR") {
				shareText = "http://ean.vg/" + response;
				shortURL = "http://ean.vg/" + response;

				if(titleUser.length>0) {
					shareText  = shareText + ' - ' + titleUser;
				}

				if( (optionAddress ? 1 : 0) == 1) {
					shareText  = shareText + ' Address: ' + address;
				}

				if( (optionLatLon ? 1 : 0) == 1) {
					shareText  = shareText + ' ' + 'lat: ' + displayLat + '  lon:' + displayLon;
				}


				$.mobile.changePage( "#sharepage", { transition: "slide"} );
			} else {
				alert("Oops...something went wrong");
			}
		});
	}, //Save


	codeAddressLatLon: function(LatLonPoint){
		MainJS.clearOverlays();
		geocoder.geocode({'latLng': LatLonPoint}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				address = results[0].formatted_address;
			} else {
				address = '';
			}
		});


		
		displayLat = MainJS.roundLatLon(LatLonPoint.lat(),5);
		displayLon = MainJS.roundLatLon(LatLonPoint.lng(),5);

		var latlonString = 'lat: ' + displayLat + '  lon:' + displayLon;
		var infowindow = new google.maps.InfoWindow({
			content: '<p>' + address + '</p>' + '<p>' + latlonString + '</p>'
		});

		var marker = new google.maps.Marker({
			map: map,
			position: LatLonPoint,
			clickable: true
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map,marker);
		});

		markersArray.push(marker);
		map.setCenter(LatLonPoint);
		infowindow.open(map,marker);

	}, // codeAddressLatLon

	roundLatLon: function(num, places) {
		var mult = Math.pow(10, places);
		return Math.round(num * mult) / mult;
	},//roundLatLon

	clearBack: function() {
		shortURL = "";
		shareText = "";
		displayLat = "";
		displayLon = "";
		LatLonPosition ="";
		address = "";
		$('#TitleShare').val('');
		$('#DescriptionShare').val('');
		$('#search_location').val('');

		MainJS.clearOverlays();
		$.mobile.changePage( "#rootpage", { transition: "slide"} );
	}// clearBack

} // MainJS
