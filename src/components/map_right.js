import React, {Component} from 'react'
import $ from 'jquery'
import {geoMercator, geoPath, max, min, scaleLinear} from 'd3'
import worlddata from './mappa.js'
import meteordata from '../meteoriti.js'
import _ from 'lodash'

class MapRight extends Component {

  constructor() {
    super()

  }

  componentDidMount() {
    console.log(this.state.meteorsFiltered)
  }

  componentWillMount() {
    this.projection = geoMercator()
    this.pathGenerator = geoPath().projection(this.projection.scale(250).translate([650, 450]))
    this.setState({meteorsFiltered: _.filter(meteordata, (item) => {
      return item.geolocation  && item.mass && item.mass < 1000000
    })})
  }

  expandLine(coord, e, item, i) {

    var lineY2 = this.projection(coord)[1]
    // console.log(e.target.nextSibling.getAttribute('y2'))
    // var y2 = e.target.nextSibling.getAttribute('y2')
    // e.target.nextSibling.setAttribute('y2', y2 + 90)

    return lineY2 + 80
  }

  render() {

    const countries = worlddata.features.map((item, i) => <path key={'path' + i} d={this.pathGenerator(item)} className='countries'/>)

    var maxMass = max(_.map(this.state.meteorsFiltered, (item) => {
      return parseFloat(item.mass)
    }))
    var minMass = min(_.map(this.state.meteorsFiltered, (item) => {
      return parseFloat(item.mass)
    }))
    var convertMasses = scaleLinear().domain([minMass, maxMass]).range([2, 20])
    const meteorites = this.state.meteorsFiltered.map((item, i) =>   {

            return(

                                                              <svg className="singleSvg">
                                                                <circle key={'patho' + i}
                                                                onMouseEnter={e => {this.expandLine(item.geolocation.coordinates, e, item, i)}}

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
                                                            </svg>



            )})

    var clientHeight = window.document.documentElement.clientHeight
    var clientWidth = window.document.documentElement.clientWidth

    return (



      <div id="map-holder">
        <div className="title">ASTEROIDS AMONG US</div>
        <svg className="svgContainer"
              viewBox={'0 0 ' + clientWidth + ' ' + clientHeight }
              preserveAspectRatio="xMinYMin">
          {countries}
          {meteorites}
        </svg>
      </div>
    )

  }
}

export default MapRight;
