import React, { Component } from 'react'
import $ from 'jquery'
import * as d3 from 'd3'
class Map extends Component {

constructor() {
  super()

  // DEFINE VARIABLES
  // Define size of map group
  // Full world map is 2:1 ratio
  // Using 12:5 because we will crop top and bottom of map
  var w = 3000;
  var h = 1250;
  // variables for catching min and max zoom factors
  var minZoom;
  var maxZoom;

  // Define map projection
  this.projection = d3
     .geoEquirectangular()
     .center([0, 15]) // set centre to further North
     .scale([w/(2*Math.PI)]) // scale to fit group width
     .translate([w/2,h/2]) // ensure centred in group

     // Define map path
   this.path = d3
      .geoPath()
      .projection(this.projection)

      // apply zoom to countriesGroup
      function zoomed() {
         t = d3
            .event
            .transform
         ;
         countriesGroup.attr(
            "transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
         );
      }

      // Define map zoom behaviour
    var zoom = d3
       .zoom()
       .on("zoom", zoomed)


   this.svg = d3
      .select("#map-holder")
      .append("svg")
      // set to the same size as the "map-holder" div
      .attr("width", $("#map-holder").width())
      .attr("height", $("#map-holder").height())
      // add zoom functionality
      .call(zoom)

      // get map data
      d3.json("./mappa.geo.json",
      function(json) {
        /////////////////////////////////////////////
        //////// Here we will put a lot of code concerned
        //////// with drawing the map.


        countriesGroup = svg
           .append("g")
           .attr("id", "map")
        ;
        // add a background rectangle
        countriesGroup
           .append("rect")
           .attr("x", 0)
           .attr("y", 0)
           .attr("width", w)
           .attr("height", h)

     }
   )


}

getTextBox(selection) {
  selection.each(function(d) {
    d.bbox = this.getBBox();
  });
}

  render() {
    return (
      <div className="mapContainer" id="map-holder">
        ASTEROIDS AMONG US
        <div>

        </div>
      </div>
    );
  }
}

export default Map;
