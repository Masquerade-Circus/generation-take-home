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
 *    <SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={makrers}/>
 *
 * ToDo's:
    Create a public repo
    Comment functions
    Generate docs
    Configure for install with npm
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

        google.maps.event.addListener( this.map, 'idle', () => this.updateMarkers());
    }

    updateMarkers(){
        this.marker = [];
        if (typeof google === 'object' && typeof google.maps === 'object' && this.semanticMapsActive) {
            this.geocoder = this.geocoder || new google.maps.Geocoder();
            console.log(this.props.markers.length);
            this.geoCodeAll(this.props.markers);
            // for (let i in this.props.markers) {
            //     let currentMarker = this.props.markers[i],
            //         lat = currentMarker.lat,
            //         lng = currentMarker.lng,
            //         icon = currentMarker.icon,
            //         title = currentMarker.title,
            //         content = currentMarker.content,
            //         callback = currentMarker.callback,
            //         open = currentMarker.open || false,
            //         address = currentMarker.address;
            //
            //     this.addMarker(currentMarker);
            // }
        }

    }

    geoCode(currentMarker){
        return new Promise((resolve, reject) => {
            if (currentMarker.lat !== undefined && currentMarker.lng !== undefined){
                return resolve();
            }
            this.geocoder.geocode( { address: currentMarker.address}, (results, status) => {
                if (status == google.maps.GeocoderStatus.OK) {
                    currentMarker.lat = results[0].geometry.location.lat();
                    currentMarker.lng = results[0].geometry.location.lng();

                    return resolve();
                }

                if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    setTimeout(() => {
                        resolve(this.geoCode(currentMarker));
                    },1020);
                    return;
                }

                console.log(currentMarker.address);
                console.warn('Direction could not be resolved: ' + status);
                resolve();
            });
        });
    }

    geoCodeAll(markers = [], i = 0){
        return new Promise((resolve, reject) => {
            if(i >= markers.length){
                return resolve();
            }

            this.geoCode(markers[i])
                .then(() => {
                    i++;
                    console.log(i);
                    resolve(this.geoCodeAll(markers,i));
                });
        });

    }

    inBounds(lat, lng) {
        let bounds = this.map.getBounds(),
            ne = bounds.getNorthEast().toJSON(),
            sw = bounds.getSouthWest().toJSON(),
            eastBound = lng < ne.lng,
            westBound = lng > sw.lng,
            inLong,
            inLat;

        if (ne.lng < sw.lng) {
            inLong = eastBound || westBound;
        } else {
            inLong = eastBound && westBound;
        }

        inLat = lat > sw.lat && lat < ne.lat;
        return inLat && inLong;
    }

    /*Markers*/
    addMarker(address, lat, lng, icon, title, content, callback, open) {
        return new Promise((resolve, reject) => {
            let marker = {
                  map: this.map,
                  optimized: false,
                //   animation: google.maps.Animation.DROP
            };

            marker.icon = icon || true;
            // marker.title = title || '';

            let bounds = this.map.getBounds();

            if( address !== undefined ){
                this.geocoder.geocode( { address: address, bounds: bounds}, (results, status) => {
                    if (status == google.maps.GeocoderStatus.OK) {
                        lat = results[0].geometry.location.lat();
                        lng = results[0].geometry.location.lng();
                        console.log(this.inBounds(lat, lng), this.marker.length);
                        if (this.inBounds(lat, lng)){
                            marker.position = new google.maps.LatLng(lat, lng);
                            let i = this.marker.push(new google.maps.Marker(marker));
                            this.addInfoMarker(this.marker[i - 1], content, callback, open, marker);
                        }

                        return resolve();
                    }

                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        setTimeout(() => {
                            resolve(this.addMarker(address, lat, lng, icon, content, callback, open));
                        },1020);
                        return;
                    }

                    console.log(address);
                    console.warn('Direction could not be resolved: ' + status);
                });
                return;
            }

            marker.position = new google.maps.LatLng(lat, lng);
            let i = this.marker.push(new google.maps.Marker(marker));
            this.addInfoMarker(this.marker[i - 1], content, callback, open, marker);
            resolve();
        });

    }

    addInfoMarker(marker, content, callback, open, data) {
        this.infowindow = this.infowindow || new google.maps.InfoWindow({content: ''});
        let _this = this;
      google.maps.event.addListener(marker, 'click', function() {
        // _this.map.setCenter(marker.getPosition());

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
