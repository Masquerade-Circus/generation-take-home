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
        /**
         * The property where the real markers will be stored
         * @type {Array}
         */
        this.marker = [];
        /**
         * This property will be updated when google maps is ready to be instantiated
         * @type {Boolean}
         */
        this.semanticMapsActive = false;
    }

    componentDidMount() {
        /**
         * Set the callback for when the google maps api is ready
         * When this function is called, set the semanticMapsActive variable to true
         * @method googlemapsloaded
         * @return {Void}
         */
        window.googlemapsloaded = () => {
            this.semanticMapsActive = true;
        };
        /**
         * Gets the div container in which render the map
         * @type {DOMElement}
         */
        this.container = document.getElementById(this.props.id);

        /**
         * Configure the styles of the map
         * @type {Method}
         */
        this.configureStyle();

        /**
         * If google maps api its already loaded
         * put the semanticMapsActive variable to true
         * and initialize the map.
         * @method if
         * @return {Void}
         */
        if (typeof google === 'object') {
            this.semanticMapsActive = true;
            this.initSemanticMaps();
            return;
        }

        /**
         * If google maps api isn't loaded,
         * try to load it
         */
        this.loadGoogle();
    }

    /**
     * This method will configure the styles to render the map based on the properties passed on the component
     * @method configureStyle
     * @return {Void}
     */
    configureStyle(){
        if (this.props.landscape !== undefined){
            this.props.styles.push({
                'featureType': 'landscape',
                'stylers': [{
                    'color': '#' + this.props.landscape
                }]
            });
        }

        if (this.props.road !== undefined) {
            this.props.styles.push({
                'featureType': 'road',
                'stylers': [{
                    'color': '#' + this.props.road
                }]
            });
        }

        if (this.props.water !== undefined) {
            this.props.styles.push({
                'featureType': 'water',
                'stylers': [{
                    'color': '#' + this.props.water
                }]
            });
        }

        if (this.props.text !== undefined) {
            this.props.styles.push({
                'elementType': 'labels.text',
                'stylers': [{
                        'saturation': 1
                    }, {
                        'weight': 0.4
                    }, {
                        'color': '#' + this.props.text
                }]
            });
        }

        if (this.props.poi !== undefined) {
            this.props.styles.push({
                'featureType': 'poi',
                'elementType': 'geometry',
                'stylers': [{
                    'color': '#' + this.props.poi
                }]
            });
        }
    }

    /**
     * This method creates the script to load the google maps api
     * and appends it to the head, then initialize the listener for the map
     * @method loadGoogle
     * @return {Void}
     */
    loadGoogle() {
        let script = document.createElement('script'),
            key = this.props.apiKey.trim().length > 0 ? ('&key='+this.props.apiKey) : '',
            s;

        script.type = 'text/javascript';
        script.src = 'http://maps.googleapis.com/maps/api/js?callback=googlemapsloaded&libraries=places'+key;
        s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);

        this.initSemanticMaps();
    }

    /**
     * This method checks if google maps api is fully loaded and ready,
     * if it's not, try to chack it again every 100 milliseconds,
     * and if it's ready, initialize the map
     * @method initSemanticMaps
     * @return {Void}
     */
    initSemanticMaps() {
        if (typeof google !== 'object' || typeof google.maps !== 'object' || !this.semanticMapsActive) {
            setTimeout(() => {
                this.initSemanticMaps();
            }, 100);
            return;
        }

        /**
         * Instantiate a new map
         * @type {google}
         */
        this.map = new google.maps.Map(this.container, {
            center: new google.maps.LatLng(this.props.lat, this.props.lng),
            zoom: +this.props.zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: this.props.styles
        });

        /**
         * Creates a new geocoder instance
         * @type {google.maps.Geocoder}
         */
        this.geocoder = new google.maps.Geocoder();

        /**
         * Start to geocode all the markers that does not have a lat and a lng property defined
         * @param {Array} this.props.markers    The array of markers obtained from the property of the component
         */
        this.geoCodeAll(this.props.markers);

        /**
         * When the window rezise pans to the center of the map
         */
        this.addEvent(window, 'resize', () => {
            this.map.panTo(new google.maps.LatLng(this.props.lat, this.props.lng));
        });

        /**
         * Every time the map change its bounds
         * update the visible markers
         * @type {Array}
         */
        google.maps.event.addListener( this.map, 'idle', () => this.updateMarkers());
    }

    /**
     * This method will updtate the visible markers that are within the map bounds
     * @method updateMarkers
     * @return {Void}
     */
    updateMarkers(){
        // First delete all the map markers
        this.clearMarkers();
        // Set the marker property to an empty array
        this.marker = [];
        // For each marker in the data, try to add it to the map
        this.props.markers.map(marker => this.addMarker(marker));
    }

    /**
     * This method will delete all the current markers
     * @method clearMarkers
     * @return {Void}
     */
    clearMarkers(){
        // try to initialize the marker property to an empty array if its not initialized already
        this.marker = this.marker || [];
        // For each marker, set its map to null to delete it
        this.marker.map(marker => marker.setMap(null));
    }

    /**
     * This method will try to geocode a marker until its fully geocoded
     * If it's an over query limit, it will try to geocode it again within a second
     * If the passed object already have a lat and a lng property setted, then
     * resolves mmediately
     * @method geoCode
     * @param  {Object} currentMarker   The object with the properties to geocode
     * @return {Promise}                Promise that resolves when the marker is fully geocoded
     */
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

    /**
     * This method will try to geocode all the markers one by one
     * When a marker is fully geocoded it tries to add it to the map
     * and call the onUpdate passed method if any
     * @method geoCodeAll
     * @param  {Array}    [markers=[]]      The marker objects that will be geocodded
     * @param  {Number}   [i=0]             Current index of the marker that its currently geocoding
     * @return {Promise}                    Promise that resolves when all the markers are fully geocoded
     */
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

    /**
     * This method checks if the lat and lng passed are within the bounds of the map
     * @method inBounds
     * @param  {Float} lat
     * @param  {Float} lng
     * @return {Boolean}
     */
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

    /**
     * This method try to add a marker to the map
     * @method addMarker
     * @param  {Object}  currentMarker      Object with the properties of the marker that will be added
     */
    addMarker(currentMarker) {
        /**
         * Process only markers that have the lat and lng properties setted
         * @method if
         * @param  {Object} currentMarker   Object with the properties of the marker that will be added
         * @return {Void}
         */
        if (currentMarker !== undefined && currentMarker.lat !== undefined && currentMarker.lng !== undefined){
            let markerOptions = {
                  map: this.map,
                  optimized: false,
            };

            markerOptions.icon = currentMarker.icon || true;

            /**
             * If the marker is within the bounds of the map add it to the map
             * @method if
             */
            if (this.inBounds(currentMarker.lat, currentMarker.lng)){
                markerOptions.position = new google.maps.LatLng(currentMarker.lat, currentMarker.lng);
                let i = this.marker.push(new google.maps.Marker(markerOptions));
                this.addInfoMarker(this.marker[i - 1], currentMarker.content, currentMarker.callback, currentMarker.open, currentMarker);
            }
        }
    }

    /**
     * Creates a new info window and adds the callback to the marker if any
     * @method addInfoMarker
     * @param  {google.maps.Marker}      marker
     * @param  {String}      content                The content to show on the info window
     * @param  {Function}    callback               Method that will be called when the user clicks on the marker
     * @param  {Boolean}      open                  If the infowindow must be open from the start
     * @param  {Object}      data                   Additional data that will be passed to the callback when called
     */
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

    /**
     * CrossBrowser Event pollyfill
     * @method addEvent
     * @param  {DOMElement}   element
     * @param  {String}   type          Type of event that will be attached
     * @param  {Function} callback      Handler of the event
     */
    addEvent(element, type, callback) {
        if (element == null || typeof(object) == 'undefined')
            return;

        // If other than Msie
        if (element.addEventListener) {
            element.addEventListener(type, callback, false);
            return;
        }

        // If Msie
        if (element.attachEvent) {
            element.attachEvent('on' + type, callback);
            return;
        }

        // Fallback to on[event] method
        element['on'+type] = callback;
    }

    render() {
        return (<div id={this.props.id}/>);
    }

}
