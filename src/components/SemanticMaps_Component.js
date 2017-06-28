import React, { Component } from 'react';

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
        let script = document.createElement("script"),
            key = this.props.apiKey.trim().length > 0 ? ("&key="+this.props.apiKey) : '',
            s;

        script.type = "text/javascript";
        script.src = "http://maps.googleapis.com/maps/api/js?callback=googlemapsloaded&libraries=places"+key;
        s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
        this.initSemanticMaps();
    }

    initSemanticMaps() {
        if (typeof google !== 'object' || typeof google.maps !== 'object' || !this.semanticMapsActive) {
            setTimeout(() => {
                this.initSemanticMaps();
            }, 100);
            return;
        }

        this.map = new google.maps.Map(this.container, {
            center: new google.maps.LatLng(this.props.lat, this.props.lng),
            zoom: +this.props.zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: this.props.styles
        });

        this.geocoder = this.geocoder || new google.maps.Geocoder();
        this.geoCodeAll(this.props.markers);

        this.addEvent(window, 'resize', () => {
            this.map.panTo(new google.maps.LatLng(this.props.lat, this.props.lng));
        });

        google.maps.event.addListener( this.map, 'idle', () => this.updateMarkers());
    }

    updateMarkers(){
        this.clearMarkers();
        this.marker = [];
        this.props.markers.map(marker => this.addMarker(marker));
    }

    clearMarkers(){
        this.marker = this.marker || [];
        this.marker.map(marker => marker.setMap(null));
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
                    this.addMarker(markers[i]);
                    this.props.onUpdate && this.props.onUpdate.call && this.props.onUpdate(markers);
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

    addMarker(currentMarker) {
        if (currentMarker !== undefined && currentMarker.lat !== undefined && currentMarker.lng !== undefined){
            let marker = {
                  map: this.map,
                  optimized: false,
            };

            marker.icon = currentMarker.icon || true;

            let bounds = this.map.getBounds();

            if (this.inBounds(currentMarker.lat, currentMarker.lng)){
                marker.position = new google.maps.LatLng(currentMarker.lat, currentMarker.lng);
                let i = this.marker.push(new google.maps.Marker(marker));
                this.addInfoMarker(this.marker[i - 1], currentMarker.content, currentMarker.callback, currentMarker.open, currentMarker);
            }
        }
    }

    addInfoMarker(marker, content, callback, open, data) {
        this.infowindow = this.infowindow || new google.maps.InfoWindow({content: ''});
        google.maps.event.addListener(marker, 'click', () => {

            if (content && content.big && content.trim().length > 0) {
              this.infowindow.open(this.map, marker);
              this.infowindow.setContent(content);
            }

            if (callback && callback.call){
                callback(this.map, marker, data, this.infowindow);
                data.icon = marker.icon;
            }
        });

        if (open) {
            new google.maps.event.trigger(marker, 'click');
        }

    }

    addEvent(element, type, callback) {
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
