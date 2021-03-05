import React from "react";
import L from "leaflet";
import statesData from './us-states'
import './map.css'
import {covid_vaccine_provider_with_country_geo_json} from './covid_vaccine_provider_with_country_geo_json';

const convid_data = covid_vaccine_provider_with_country_geo_json()

const style = {
  width: "100%",
  height: "100vh"
};

const mapStyle = (feature) => {
  return ({
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.covid_vaccine!==undefined? feature.properties.covid_vaccine.total:0 )
  });
}

const getColor = (d) =>{
  return d > 10000000
  ? "#800026"
  : d > 5000000
    ? "#BD0026"
    : d > 200000
      ? "#E31A1C"
      : d > 100000
        ? "#FC4E2A"
        : d > 50000
          ? "#FD8D3C"
          : d > 2000? "#FEB24C" : d > 100 ? "#FED976" : "#FFEDA0";
}

class Map extends React.Component {
  componentDidMount() {
    // create map
    this.map = L.map("map", {
      center: [0, 0],
      zoom: 2,
      layers: [
        L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmxvcnZhbmRla2VyY2tob3ZlIiwiYSI6ImNqdGZyMmtrejAxYWw0M3A2OGtwdTMxNWEifQ.5U-KSDZfyKNC_Z74fEWj6g",
        {
          maxZoom: 4,
          id: "streets-v9"
        })
      ]
    });

    this.geojson = L.geoJson(convid_data, {
      style: mapStyle,
      onEachFeature: this.onEachFeature
    }).addTo(this.map);

    this.info = L.control();

    this.info.onAdd = function(map) {
      this._div = L.DomUtil.create("div", "info");
      this.update();
      return this._div;
    };


    this.info.update = function(props) {
      let vaccined_number = props && props.covid_vaccine?props.covid_vaccine.total:"data not found"
      this._div.innerHTML =
        (props
          ? "<div class ='heading'>Coronavirus Vaccine Tracker</div>"+ 
          "<div class='country-name'>"+
            props.name +
          "</div>"+
          "<div class='vaccined-number'>"+
            "<span class='tag'>Total vaccinations: </span>"+vaccined_number+
          "</div>"
          : "<div class ='heading'>Hover over a state</div>");
    };

    this.info.addTo(this.map);

    // add layer
    this.layer = L.layerGroup().addTo(this.map);
  }
  onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.zoomToFeature
    });
  }
  highlightFeature = (e) => {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7
    });

    layer.bringToFront();

    this.info.update(layer.feature.properties);
  }
  resetHighlight = (event) => {
    this.geojson.resetStyle(event.target);
    this.info.update();
  }
  zoomToFeature = (e) => {
    this.map.fitBounds(e.target.getBounds());
  }
  render() {
    return <div id="map" style={style} />;
  }
}

export default Map;
