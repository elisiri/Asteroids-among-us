import React, {Component} from 'react'
import $ from 'jquery'
import * as d3 from 'd3'
class Map extends Component {

  constructor() {
    super()

    // DEFINE VARIABLES
    // Define size of map group
    // Full world map is 2:1 ratio
    // Using 12:5 because we will crop top and bottom of map
    this.w = 3000;
    this.h = 1250;
    // variables for catching min and max zoom factors
    this.minZoom;
    this.minZoom;
    this.countriesGroup
    this.svg

    // Define map projection
    this.projection = d3.geoEquirectangular().center([0, 15]). // set centre to further North
    scale([this.w / (2 * Math.PI)]). // scale to fit group width
    translate([
      this.w / 2,
      this.h / 2
    ]) // ensure centred in group

    // Define map path
    this.path = d3.geoPath().projection(this.projection)

    // Define map zoom behaviour
    this.zoom = d3.zoom().on("zoom", this.zoomed)

    // get map data

  }

  componentDidMount() {
    $(window).resize(function() {
      // Resize SVG
      this.svg.attr("width", $("#map-holder").width()).attr("height", $("#map-holder").height());
      this.initiateZoom();
    })

    d3.json("./mappa.geo.json", function(json) {
      //////// Here we will put a lot of code concerned
      //////// with drawing the map.

      this.svg = d3.select("#map-holder").append("svg")
      // set to the same size as the "map-holder" div
        .attr("width", $("#map-holder").width()).attr("height", $("#map-holder").height())
      // add zoom functionality
        .call(this.zoom)

      console.log(d3.select("#map-holder")).append("g").attr("id", "map");
      // add a background rectangle
      this.countriesGroup.append("rect").attr("x", 0).attr("y", 0).attr("width", this.w).attr("height", this.h)

      // draw a path for each feature/country
      var countries = this.countriesGroup.selectAll("path").data(json.features).enter().append("path").attr("d", this.path).attr("id", function(d, i) {
        return "country" + d.properties.iso_a3;
      }).attr("class", "country")
      // add a mouseover action to show name label for feature/country
        .on("mouseover", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
      }).on("mouseout", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
      })
      // add an onclick action to zoom into clicked country
        .on("click", function(d, i) {
        d3.selectAll(".country").classed("country-on", false);
        d3.select(this).classed("country-on", true);
        this.boxZoom(this.path.bounds(d), this.path.centroid(d), 20);
      })

      this.countryLabels = this.countriesGroup.selectAll("g").data(json.features).enter().append("g").attr("class", "countryLabel").attr("id", function(d) {
        return "countryLabel" + d.properties.iso_a3;
      }).attr("transform", function(d) {
        return ("translate(" + this.path.centroid(d)[0] + "," + this.path.centroid(d)[1] + ")");
      })
      // add mouseover functionality to the label
        .on("mouseover", function(d, i) {
        d3.select(this).style("display", "block");
      }).on("mouseout", function(d, i) {
        d3.select(this).style("display", "none");
      })
      // add an onlcick action to zoom into clicked country
        .on("click", function(d, i) {
        d3.selectAll(".country").classed("country-on", false);
        d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
        this.boxZoom(this.path.bounds(d), this.path.centroid(d), 20);
      })

      // add the text to the label group showing country name
      this.countryLabels.append("text").attr("class", "countryName").style("text-anchor", "middle").attr("dx", 0).attr("dy", 0).text(function(d) {
        return d.properties.name;
      }).call(this.getTextBox);
      // add a background rectangle the same size as the text
      this.countryLabels.insert("rect", "text").attr("class", "countryBg").attr("transform", function(d) {
        return "translate(" + (
        d.bbox.x - 2) + "," + d.bbox.y + ")";
      }).attr("width", function(d) {
        return d.bbox.width + 4;
      }).attr("height", function(d) {
        return d.bbox.height;
      })

    })

    console.log(this.svg)

  }

  // zoom to show a bounding box, with optional additional padding as percentage of box size
  boxZoom(box, centroid, paddingPerc) {
    var minXY = box[0];
    var maxXY = box[1];
    // find size of map area defined
    var zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    var zoomHeight = Math.abs(minXY[1] - maxXY[1]);
    // find midpoint of map area defined
    var zoomMidX = centroid[0];
    var zoomMidY = centroid[1];
    // increase map area to include padding
    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);
    // find scale required for area to fill svg
    var maxXscale = $("svg").width() / zoomWidth;
    var maxYscale = $("svg").height() / zoomHeight;
    var zoomScale = Math.min(maxXscale, maxYscale);
    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, this.maxZoom);
    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, this.minZoom);
    // Find screen pixel equivalent once scaled
    var offsetX = zoomScale * zoomMidX;
    var offsetY = zoomScale * zoomMidY;
    // Find offset to centre, making sure no gap at left or top of holder
    var dleft = Math.min(0, $("svg").width() / 2 - offsetX);
    var dtop = Math.min(0, $("svg").height() / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max($("svg").width() - this.w * zoomScale, dleft);
    dtop = Math.max($("svg").height() - this.h * zoomScale, dtop);
    // set zoom
    this.svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
  }

  initiateZoom() {
    // Define a "min zoom"
    this.minZoom = Math.max($("#map-holder").width() / this.w, $("#map-holder").height() / this.h);
    // Define a "max zoom"
    this.maxZoom = 20 * this.minZoom;
    //apply these limits of
    this.zoom.scaleExtent([this.minZoom, this.maxZoom]). // set min/max extent of zoom
    translateExtent([
      [
        0, 0
      ],
      [
        this.w, this.h
      ]
    ]); // set extent of panning
    // define X and Y offset for centre of map
    var midX = ($("#map-holder").width() - (this.minZoom * this.w)) / 2;
    var midY = ($("#map-holder").height() - (this.minZoom * this.h)) / 2;
    // change zoom transform to min zoom and centre offsets
    this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(this.minZoom));
  }

  // apply zoom to countriesGroup
  zoomed() {
    var t = d3.event.transform;
    this.countriesGroup.attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
  }

  getTextBox(selection) {
    selection.each(function(d) {
      d.bbox = this.getBBox();
    });
  }

  render() {
    return (<div className="mapContainer">
      ASTEROIDS AMONG US
      <div id="map-holder"></div>
    </div>);
  }
}

export default Map;
