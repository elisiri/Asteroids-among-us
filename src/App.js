import React, { Component } from 'react';
import MapRight from './components/map_right.js';
import Globe from './components/globe.js';
import './App.css';
import './index.css';

class App extends Component {


  render() {
    return (
      <div className="App">
        <Globe></Globe>
      </div>
    );
  }
}

export default App;
