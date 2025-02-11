import { EarthquakeApp } from './EarthquakeApp.js';

document.addEventListener('DOMContentLoaded', () => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1N2NlNDZlZS01NTBkLTRkMDktOWMxZi04M2U1MTc0NDE3NDciLCJpZCI6MTU4MjUsImlhdCI6MTczOTIyMDQ2OX0.-TK7EMlZfJNg654qL2wfJv2jbBrmIYIEYe5lIcBsRh4';
  Cesium.createWorldBathymetryAsync({requestVertexNormals: true}).then(
    function(provider) {
      const app = new EarthquakeApp(provider);
      app.init();
    },
    function(error) {
      console.error(error);
    }
  );
});
