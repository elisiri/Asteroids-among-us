import React, {Component} from 'react'
import $ from 'jquery'
import {geoMercator, geoPath, max, min, scaleLinear, ticks, event, zoom, select, selectAll, translate} from 'd3'
import worlddata from './mappa.js'
import meteordata from '../meteoriti.js'
import _ from 'lodash'

class MapRight extends Component {

  constructor() {
    super()

    this.clientHeight = window.document.documentElement.clientHeight
    this.clientWidth = window.document.documentElement.clientWidth
    this.zoom = zoom().scaleExtent([1, 4]).on("zoom", this.zoomed)
    this.state = {
     myel: [{html:''}]
    }
    // this.zoom2 = zoom().scaleExtent([-4, 1]).on("zoom", this.deZoomed)
  }

  zoomed = () => {
    this.g.setAttribute("transform", event.transform)
    // select('#use').attr("transform", event.transform)
    this.setState({zoomCoeffk: event.transform.k,
                  zoomCoeffx: event.transform.x,
                  zoomCoeffy: event.transform.y})
    console.log(this.state.zoomCoeffx, this.state.zoomCoeffy)

  }
  // deZoomed = () => {
  //
  //   _.forEach(selectAll('.singleSvg'), (array2, index) => {
  //     _.forEach(array2, (array3, i) => {
  //       _.forEach(array3, (item, ind)=> {
  //         var cy = select(item).attr('ypoint')
  //         var cx = select(item).attr('xpoint')
  //         select(item).attr("transform", ' translate('+ -cx +', ' + -cy + ') ' + event.transform + ' translate('+cx+', ' + cy + ') ')
  //       })
  //
  //     })
  //
  //   })
  //
  // }

  componentDidMount() {
    select(this.svgContainer).call(this.zoom)
    // select(this.svgBigContainer).call(this.zoom2)

  }

  componentWillMount() {
    this.projection = geoMercator()
    this.pathGenerator = geoPath().projection(this.projection.scale(250).translate([this.clientWidth/2 - 100, 450]))
    this.setState({meteorsFiltered: _.filter(meteordata, (item) => {
      return item.geolocation  && item.mass && item.mass < 1000000
    })})
  }

  bringUp = (item, e) => {
    if (item) this.setState({upperSvg: item.id})
    console.log(e.target.parentNode);
    this.setState({
     myel: [{html:e.target.parentNode}]
   })
  }

  render() {

    if(this.state.zoomCoeffk !== 1) this.state.upperSvg = ''

    const countries = worlddata.features.map((item, i) => <path key={'path' + i} d={this.pathGenerator(item)} className='countries'/>)

    var maxMass = max(_.map(this.state.meteorsFiltered, (item) => {
      return parseFloat(item.mass)
    }))
    var minMass = min(_.map(this.state.meteorsFiltered, (item) => {
      return parseFloat(item.mass)
    }))

    var convertMasses = scaleLinear().domain([minMass, maxMass]).range([2, 20])
    var convertColors = scaleLinear().domain(ticks(0, 6, 2)).range(['rgb(0, 171, 255)', 'rgb(148, 54, 255)'])
    const meteorites = this.state.meteorsFiltered.map((item, i) =>   {
            if (item.year) item.anno = item.year.toString().substring(0, 4)
            return(

                <g className="singleSvg" ref={e => { this.single = e}} id={item.id}
                  xpoint={this.projection(item.geolocation.coordinates)[0]}
                  ypoint={this.projection(item.geolocation.coordinates)[1]}
                  style={{transformOrigin: this.projection(item.geolocation.coordinates)[0] +'px '+ this.projection(item.geolocation.coordinates)[1]+'px '}}
                  transform={'scale(' + 1/this.state.zoomCoeffk +')'}>
                  <circle key={'patho' + i}
                  onMouseEnter={e => {this.bringUp(item, e)}}
                  fill={convertColors(parseInt(item.anno))}
                  cx={this.projection(item.geolocation.coordinates)[0]}
                  cy={this.projection(item.geolocation.coordinates)[1]}
                  r={convertMasses(parseFloat(item.mass))} className='meteors'/>
                <line key={'pathos' + i}
                  x1={this.projection(item.geolocation.coordinates)[0]}
                  y1={this.projection(item.geolocation.coordinates)[1]}
                  x2={this.projection(item.geolocation.coordinates)[0]}
                  y2={this.projection(item.geolocation.coordinates)[1] + 80}
                  stroke="black" strokeWidth="0.6" className="line"/>
                <rect key={'pa' + i} className="label"
                  x={this.projection(item.geolocation.coordinates)[0] + 8}
                  y={this.projection(item.geolocation.coordinates)[1] + 50}/>
                <text key={'pat' + i} className="label-text"
                  x={this.projection(item.geolocation.coordinates)[0] + 18}
                  y={this.projection(item.geolocation.coordinates)[1] + 69}>
                  {item.name} </text>
              </g>

            )})



    return (

      <div id="map-holder" ref={e => { this.svgBigContainer = e}}>
        <div className="title">ASTEROIDS AMONG US</div>

        <svg className="svgContainer"
              ref={e => { this.svgContainer = e}}
              viewBox={'0 0 ' + this.clientWidth + ' ' + this.clientHeight }
              preserveAspectRatio="xMinYMin">
          <g ref={e => { this.g = e}}>
          {countries}
            <svg ref={e => { this.svg = e}}>
              {_.map(this.state.myel, item => <g dangerouslySetInnerHTML={{__html:item.html}}></g>)}
              {meteorites}

            </svg>


          </g>


        </svg>

      </div>
    )

  }
}

export default MapRight;
