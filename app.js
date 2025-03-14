// Initialize the Mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJwMTQwIiwiYSI6ImNtNXk4ZHRveDBmYTcycm9ubWJ1ZnQ2eWEifQ.w1muI6Zs2HHAfKqeD5EiWw'; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-74.006, 40.7128], // Initial center [Longitude, Latitude] for New York City
  zoom: 12
});

let points = []; // To store the points selected by the user

// Add a marker on map click
map.on('click', (e) => {
  const coords = e.lngLat;
  const marker = new mapboxgl.Marker()
    .setLngLat(coords)
    .addTo(map);
  points.push(coords);
  console.log('Point added:', coords);
  console.log('Current points:', points); // Debugging the points array
});

// Measure distance between two points
document.getElementById('distance').addEventListener('click', () => {
  if (points.length < 2) {
    alert('Please add at least two points on the map.');
    return;
  }

  const start = points[0];
  const end = points[1];
  console.log('Measuring distance between:', start, end);

  const from = turf.point([start.lng, start.lat]);
  const to = turf.point([end.lng, end.lat]);

  const distance = turf.distance(from, to, { units: 'kilometers' });
  console.log('Distance:', distance);

  // Display the result
  document.getElementById('output').innerText = `Distance between points: ${distance.toFixed(2)} km`;
});

// Find the nearest neighbor
document.getElementById('nearest').addEventListener('click', () => {
  if (points.length < 2) {
    alert('Please add at least two points on the map.');
    return;
  }

  const queryPoint = points[0]; // Find the nearest neighbor to the first point
  const pointsCollection = points.slice(1).map(p => turf.point([p.lng, p.lat]));
  console.log('Query point:', queryPoint);

  const query = turf.point([queryPoint.lng, queryPoint.lat]);
  
  let nearest = null;
  let minDistance = Infinity;
  
  pointsCollection.forEach(p => {
    const distance = turf.distance(query, p, { units: 'kilometers' });
    console.log('Distance to point:', distance);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = p;
    }
  });

  if (nearest) {
    const nearestCoords = nearest.geometry.coordinates;
    console.log('Nearest neighbor found:', nearestCoords);
    document.getElementById('output').innerText = `Nearest Neighbor: [${nearestCoords[0].toFixed(4)}, ${nearestCoords[1].toFixed(4)}] - Distance: ${minDistance.toFixed(2)} km`;
  } else {
    console.log('No nearest neighbor found.');
    document.getElementById('output').innerText = 'No nearest neighbor found.';
  }
});

// Create a buffer around a point
document.getElementById('buffer').addEventListener('click', () => {
  if (points.length < 1) {
    alert('Please add at least one point on the map.');
    return;
  }

  const point = points[0]; // Use the first point
  console.log('Creating buffer around point:', point);

  const buffered = turf.buffer(turf.point([point.lng, point.lat]), 1, { units: 'kilometers' });

  map.addSource('buffer', {
    type: 'geojson',
    data: buffered
  });

  map.addLayer({
    id: 'bufferLayer',
    type: 'fill',
    source: 'buffer',
    layout: {},
    paint: {
      'fill-color': 'rgba(0, 0, 255, 0.2)',
      'fill-outline-color': 'rgba(0, 0, 255, 0.5)',
    }
  });

  console.log('Buffer created:', buffered);
  document.getElementById('output').innerText = 'Buffer created with a 1 km radius around the point.';
});
