import React from 'react'
import mapboxgl from 'mapbox-gl';
import styled from '@emotion/styled'
import {isEmpty} from 'lodash'
const TOKEN = "pk.eyJ1IjoibWljaGVsc29uIiwiYSI6ImNpbzRpNnh3eDAxaTZ3M2tqamg1NGQ4dWsifQ.rELrEMloUCCMcu07f51Spg"

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 10px;
`

export default class Mapa extends React.Component{

  constructor(props){
    super(props)
    this.map = {}
  }

  getPoints = ()=>{
    return this.props.data.map((o)=>(
        {
          "type":"Feature",
          "properties":{
             "id":o.id,
             "name":o.displayName,
             "email": o.email
           },
          "geometry":{"type":"Point","coordinates":[o.lng,o.lat]}
        }
       )
    )
  }

  componentDidMount(){

    mapboxgl.accessToken = TOKEN

    this.map = new mapboxgl.Map({
      container: 'react-map',
      style: 'mapbox://styles/michelson/cjcga6dyd48ww2rlq99y1tw8m',
      zoom: 10,
      interactive: this.props.interactive
    });

    this.map.on('load', ()=> {

         const data = {
                        "type":"FeatureCollection",
                        //"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                        "features": this.getPoints()
                      } 

        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true. GL-JS will add the point_count property to your source data.
        this.map.addSource("earthquakes", {
            type: "geojson",
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: data, //"https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        this.map.addLayer({
            id: "clusters",
            type: "circle",
            source: "earthquakes",
            filter: ["has", "point_count"],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#51bbd6",
                    100,
                    "#f1f075",
                    750,
                    "#f28cb1"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
        });

        this.map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "earthquakes",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });

        this.map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "earthquakes",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
            }
        });

        // inspect a cluster on click
        this.map.on('click', 'clusters',  (e)=> {
            var features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            var clusterId = features[0].properties.cluster_id;
            this.map.getSource('earthquakes').getClusterExpansionZoom(clusterId, (err, zoom)=> {
                if (err)
                    return;

                this.map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        this.map.on('mouseenter', 'clusters', ()=> {
            this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', 'clusters', ()=> {
            this.map.getCanvas().style.cursor = '';
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.map.on('click', 'unclustered-point', (e)=> {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.name;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(this.map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        this.map.on('mouseenter', 'unclustered-point', ()=> {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'unclustered-point', ()=> {
          this.map.getCanvas().style.cursor = '';
        });

      
          this.fitBounds(()=>{
            this.props.forceZoom && this.map.setZoom(this.props.forceZoom);
          })

    });

  }

  fitBounds =(cb)=> {
    var bounds;
    // hack to fit bounds based on marker coords
    bounds = new mapboxgl.LngLatBounds();
    this.props.data.forEach(function(o) {
      if (!o.lat || !o.lng) {
        return;
      }
      return bounds.extend([o.lng, o.lat]);
    });
    if (!isEmpty(bounds)) {
      this.map.fitBounds(bounds, {
        padding: 20,
        duration: 0
      });
    }
    cb && cb()
  }

  render(){
  
    return <MapContainer 
              id="react-map" 
              style={this.props.wrapperStyle}>
              {this.props.children}
            </MapContainer>
  }
}