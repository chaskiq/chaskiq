import React from 'react'

import fetch from "isomorphic-fetch"
import { compose, withProps, withHandlers, lifecycle } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps"
import { MarkerClusterer } from "react-google-maps/lib/components/addons/MarkerClusterer"

const MapWithAMarkerClusterer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyAvTdliDnQbkpqlxPMlPDyfzYd9sw4qPbc&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer) => {
      const clickedMarkers = markerClusterer.getMarkers()
      console.log(`Current clicked markers length: ${clickedMarkers.length}`)
      console.log(clickedMarkers)
    },
  }),
  withScriptjs,
  withGoogleMap,

  lifecycle({
    componentWillMount() {
      const refs = {}

      this.setState({
        setZoom: ref => {
          refs.map = ref
          if (!ref) { return }

          var bounds = new google.maps.LatLngBounds();
          this.props.markers.forEach((p) => {
            var latLng = new google.maps.LatLng( p.lng, p.lat);
            bounds.extend(latLng);
          })
          console.log(bounds)
          refs.map.fitBounds(bounds)
        }
      })
    }
  })

)(props =>
  <GoogleMap
    ref={props.setZoom}
    defaultZoom={3}
    defaultCenter={{ lat: 25.0391667, lng: 121.525 }}
    onMapMount={()=>{
      debugger
    }}
  >
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      gridSize={60}
    >
      {props.markers.map(marker => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
        />
      ))}
    </MarkerClusterer>
  </GoogleMap>
);

export default class UserMap extends React.PureComponent {
  componentWillMount() {
    this.setState({ markers: [] })
  }

  componentDidMount() {

    /*
    const url = [
      // Length issue
      `https://gist.githubusercontent.com`,
      `/farrrr/dfda7dd7fccfec5474d3`,
      `/raw/758852bbc1979f6c4522ab4e92d1c92cba8fb0dc/data.json`
    ].join("")

    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.setState({ markers: data.photos });
      });
    */

    this.setState({ 
      markers: this.props.collection 
    });
  }

  render() {
    return (
      <MapWithAMarkerClusterer markers={this.state.markers} />
    )
  }
}