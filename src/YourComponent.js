import React, { Component } from 'react';
import SemanticMaps from './semanticMaps.react';



/*
* Use this component as a launching-pad to build your functionality.
*
*/

export default class YourComponent extends Component {

	constructor(props){
		super(props);
		this.data = [];
		fetch('store_directory.json', {
			accept : 'application/json',
		    contentType : 'application/json'
		}).then(response => response.json()).then(data => {
			for (let i in data) {
				data[i].address= data[i].Address;
				data[i].title= data[i].Name;
				data[i].content= data[i].Name;
			}
			this.data = data;
			this.forceUpdate();
		});
	}

  render() {
    return (
      <div style={divStyle}>
		  <h1> Put your solution here!</h1>
		  <SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={this.data}/>
      </div>
    );
  }
}

var divStyle = {
  border: 'red',
  borderWidth: 2,
  borderStyle: 'solid',
  padding: 20
};
