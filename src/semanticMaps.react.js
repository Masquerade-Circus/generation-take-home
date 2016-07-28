/**
 * SemanticMaps component
 * @author Christian César Robledo López christian@masquerade-circus.net
 * @description Based on the semanticMaps.js jQuery plugin https://github.com/Masquerade-Circus/semanticMaps.js

 				This component adds a custom google maps to your view.
 				You can pass an array of markers
				Each marker goes like this
					{
						lat: int, (optionalif address is added)
						lng: int, (optionalif address is added)
						address: string, (optionalif lat and lng are added)
						icon: string, (optional) // Sets a custom icon for this marker
						title: string, (optional) // Sets the title of the marker
						callback: function, (optional) // Calls this function when a click is trigger on the marker
						content: function (optional) // Adds an info window
					}
 * @example
 *	<SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={makrers}/>
 *
 * ToDo's:
 	Create a public repo
	Comment functions
	Generate docs
	Configure for install with jspm
 */

import React, { Component } from 'react';
export default class SemanticMaps extends Component {
	static defaultProps = {
		apiKey: '',
		id: 'map',
		zoom: 16,
		lat: 0,
		lng: 0,
		landscape: 'E9E5DC',
		road: 'FFFFFF',
		water: '8CB5FD',
		text: '32281E',
		poi: 'F4F3EB',
		markers: [],
		searchBox: false,
		styles: []
	};

	constructor(props){
		super(props);
		this.marker = [];
		this.semanticMapsActive = false;
	}

	componentDidMount() {
		window.googlemapsloaded = () => {
	      this.semanticMapsActive = true;
	    };
		this.container = document.getElementById(this.props.id);

		this.configureStyle();

		if (typeof google === 'object') {
			this.semanticMapsActive = true;
			this.initSemanticMaps();
			return;
		}

		this.loadGoogle();
	}

	configureStyle(){
		if (this.props.landscape != []._) this.props.styles.push({
		  "featureType": "landscape",
		  "stylers": [{
			"color": "#" + this.props.landscape
		  }]
		});
		if (this.props.road != []._) this.props.styles.push({
		  "featureType": "road",
		  "stylers": [{
			"color": "#" + this.props.road
		  }]
		});
		if (this.props.water != []._) this.props.styles.push({
		  "featureType": "water",
		  "stylers": [{
			"color": "#" + this.props.water
		  }]
		});
		if (this.props.text != []._) this.props.styles.push({
		  "elementType": "labels.text",
		  "stylers": [{
			"saturation": 1
		  }, {
			"weight": 0.4
		  }, {
			"color": "#" + this.props.text
		  }]
		});
		if (this.props.poi != []._) this.props.styles.push({
		  "featureType": "poi",
		  "elementType": "geometry",
		  "stylers": [{
			"color": "#" + this.props.poi
		  }]
		});
	}

	loadGoogle() {
	  var script = document.createElement("script");

	  var key = this.props.apiKey.trim().length > 0 ? ("&key="+this.props.apiKey) : '';
	  script.type = "text/javascript";
	  script.src = "http://maps.googleapis.com/maps/api/js?callback=googlemapsloaded&libraries=places"+key;
	  var s = document.getElementsByTagName('script')[0];
	  s.parentNode.insertBefore(script, s);
	  this.initSemanticMaps();
	}

	initSemanticMaps() {
		if (typeof google !== 'object' || typeof google.maps !== 'object' || !this.semanticMapsActive) {
			let _this = this;
			setTimeout(function() {
				_this.initSemanticMaps();
			}, 100);
			return;
		}

        this.map = new google.maps.Map(this.container, {
          center: new google.maps.LatLng(this.props.lat, this.props.lng),
          zoom: +this.props.zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: this.props.styles
        });

		this.addEvent(window, 'resize', () => {
			this.map.panTo(new google.maps.LatLng(this.props.lat, this.props.lng));
		});

		this.updateMarkers();

        if (this.props.searchBox != false)
			this.addSearchBox(google);

	}

	updateMarkers(){
		this.marker = [];
		if (typeof google === 'object' && typeof google.maps === 'object' && this.semanticMapsActive) {
			this.geocoder = this.geocoder || new google.maps.Geocoder();
			for (let i in this.props.markers) {
	          let cmarker = this.props.markers[i],
	              lat = cmarker.lat,
	              lng = cmarker.lng,
	              icon = cmarker.icon,
	              title = cmarker.title,
	              content = cmarker.html,
	              callback = cmarker.callback,
	              open = cmarker.open || false,
				  address = cmarker.address;

				this.addMarker(address, lat, lng, icon, title, content, callback, open);
	        }
		}

	}

	addSearchBox() {
	  // Create the search box and link it to the UI element.
	  var input = React.createElement('input', {
			  id: 'pac-input',
			  className: 'form-control',
			  type: 'text',
			  placeholder: 'Buscar en los alrededores',
			  style : 'max-width: 50%'
		  }),
		  searchBox,
		  markers = []
		  places = searchBox.getPlaces(),
		  bounds,
		  place_marker,
		  place;

	  this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
	  searchBox = new google.maps.places.SearchBox(input);

	  google.maps.event.addListener(searchBox, 'places_changed', () => {
		places = searchBox.getPlaces();

		if (places.length > 0) {
		  for (let i = 0; place_marker = markers[i]; i++)
		  	place_marker.setMap(null);

		  markers = [];
		  bounds = new google.maps.LatLngBounds();

		  for (let i = 0; place = places[i]; i++) {
			let options = {
			  map: this.map,
			  title: place.name,
			  animation: google.maps.Animation.DROP,
			  position: place.geometry.location
			}

			if (place.photos)
				this.props.icon = place.photos[0].getUrl({
				  'maxWidth': 35,
				  'maxHeight': 35
				});

			place_marker = new google.maps.Marker(options); // Create a marker for each place.
			markers.push(place_marker);
			bounds.extend(options.position);

			let contenido = '';
			if (place.photos)
				contenido += '<img src="' + place.photos[0].getUrl({
				  'maxWidth': 150,
				  'maxHeight': 100
				}) + '" style="display: block; float: left; margin: 0 1em 1em 0">';

			contenido += '<b>Nombre:</b> ' + place.name + '<br><b>Dirección:</b> ' + place.formatted_address + '<br>';

			if (place.types && place.types.length > 0) contenido += '<b>Tipo de establecimiento:</b> ' + place.types.join(',') + '<br>';
			if (place.website) contenido += '<b>Sitio web:</b> ' + place.website + '<br>';
			if (place.formatted_phone_number) contenido += '<b>Teléfono:</b> ' + place.formatted_phone_number + '<br>';
			if (place.opening_hours) {
			  contenido += '<b>Horarios:</b> ' + place.opening_hours.weekday_text.join(', ') + '<br>';
			  contenido += '<b>Abierto ahora:</b> ' + (place.opening_hours.open_now ? 'Sí' : 'No') + '<br>'
			};
			if (place.rating) contenido += '<b>Rating:</b> ' + place.rating + '<br>';

			this.addInfoMarker(place_marker, contenido);
		  }

		  for (i in marker)
		  	bounds.extend(marker[i].position);

		  this.map.fitBounds(bounds);
		}
	  });

	  google.maps.event.addListener(this.map, 'bounds_changed', () => {
		searchBox.setBounds(this.map.getBounds());
	  });
	}

	/*Markers*/
	addMarker(address, lat, lng, icon, title, content, callback, open) {
		let marker = {
	  		map: this.map,
	  		optimized: false,
	  		animation: google.maps.Animation.DROP
		};

		icon !== undefined && (marker.icon = icon);
		title !== undefined && (marker.title = title);

		if( address !== undefined ){
			this.geocoder.geocode( { 'address': address}, (results, status) => {
				if (status == google.maps.GeocoderStatus.OK) {
					lat = results[0].geometry.location.lat();
					lng = results[0].geometry.location.lng();
					marker.position = new google.maps.LatLng(lat, lng);
					let i = this.marker.push(new google.maps.Marker(marker));
					this.addInfoMarker(this.marker[i - 1], content, callback, open, marker);

					return;
				}

				console.warn('Direction could not be resolved: ' + status);
			});
			return;
		}

		marker.position = new google.maps.LatLng(lat, lng);
		let i = this.marker.push(new google.maps.Marker(marker));
		this.addInfoMarker(this.marker[i - 1], content, callback, open, marker);
	}

	addInfoMarker(marker, content, callback, open, data) {
		this.infowindow = this.infowindow || new google.maps.InfoWindow({content: ''});
		let _this = this;
	  google.maps.event.addListener(marker, 'click', function() {
		  console.log('hola', _this.infowindow);
		_this.map.setCenter(marker.getPosition());

		if (content && content.big && content.trim().length > 0) {
		  _this.infowindow.open(_this.map, marker);
		  _this.infowindow.setContent(content);
		}

		if (callback && callback.call)
		  callback(_this.map, marker, data, _this.infowindow);

	  });

	  if (open)
	  	new google.maps.event.trigger(marker, 'click');
	}

	addEvent = function(element, type, callback) {
	    if (element == null || typeof(object) == 'undefined')
			return;

	    if (element.addEventListener) {
	        element.addEventListener(type, callback, false);
			return;
	    }

		if (element.attachEvent) {
	        element.attachEvent("on" + type, callback);
			return;
	    }

		element["on"+type] = callback;
	}

	render() {
		return (<div id={this.props.id}/>);
	}

}
