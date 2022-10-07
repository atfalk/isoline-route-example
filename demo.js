/**
 * Calculates and displays an area reachable for the given parameters of the EV vehicle
 *
 * A full list of available request parameters can be found in the Routing API documentation.
 * see: https://developer.here.com/documentation/isoline-routing-api/dev_guide/topics/use-cases/consumption_based-isoline.html
 *
 * @param {H.service.Platform} platform A stub class to access HERE services
 */
function calculateIsolineRoute(platform) {
	
	
  var router = platform.getRoutingService();
  
  routeRequestParams = {
		'mode':'shortest;car',
        'start': 'geo!-36.85232,174.76388',
        'range': 484000,
		'rangetype': 'distance'
      };


  router.calculateIsoline(
    routeRequestParams,
    onSuccess,
    onError
  );
}

/**
 * This function will be called once the Routing REST API provides a response
 * @param {Object} result A JSON object representing the calculated range
 */
function onSuccess(result) {
  
  addRouteShapeToMap(result);
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param {Object} error The error message received.
 */
function onError(error) {
  alert('Can\'t reach the remote server');
}

/**
 * Boilerplate map initialization code starts below:
 */

// set up containers for the map + panel
var mapContainer = document.getElementById('map'),
  routeInstructionsContainer = document.getElementById('panel');

// Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
var platform = new H.service.Platform({
  apikey: window.apikey
});

var defaultLayers = platform.createDefaultLayers();

// Step 2: initialize a map - this map is centered over Berlin
var map = new H.Map(mapContainer,
  defaultLayers.vector.normal.map, {
  center: {lat: -36.85232, lng: 174.76388},
  zoom: 13,
  pixelRatio: window.devicePixelRatio || 1
});

// add a resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

// Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(result) {
	let center = new H.geo.Point(result.response.center.latitude,result.response.center.longitude);
	let isolineCoords = result.response.isoline[0].component[0].shape, linestring = new H.geo.LineString(),isolinePolygon, isolineCenter;
	isolineCoords.forEach(function(coords) {
		linestring.pushLatLngAlt.apply(linestring, coords.split(','));
	});
	
	
	isolinePolygon = new H.map.Polygon(linestring,{
		style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 0, 0.7)'
      }
	});
	
    isolineCenter = new H.map.Marker(center);
	
	map.addObjects([isolineCenter,isolinePolygon]);
  
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
      bounds: isolinePolygon.getBoundingBox()
    });
}

// Now use the map as required...
calculateIsolineRoute(platform);
