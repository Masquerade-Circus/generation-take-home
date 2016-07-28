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
		this.favorite_stores = [];
		this.stores = [];
		fetch('store_directory.json', {
			accept : 'application/json',
		    contentType : 'application/json'
		}).then(response => response.json()).then(data => {
			for (let i in data) {
				data[i].address= data[i].Address;
				data[i].title= data[i].Name;
				data[i].content = data[i].Name;
				data[i].callback = this.addFavoriteStore.bind(this);
			}
			this.data = data;
			this.forceUpdate();
		});
	}

	addFavoriteStore(map, marker, data){
		this.favorite_stores.push(<li>{data.title}</li>);
		this.forceUpdate();
	}

  render() {
    return (
      <div style={divStyle}>
		  <h1> My favorite stores!</h1>
		  <div style={leftStyle}>
			  <ul style={ulStyle}>
			  	{this.favorite_stores}
			  </ul>
		  </div><div style={rightStyle}>
		  	<SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={this.data}/>
		  </div>
      </div>
    );
  }
}

var divStyle = {
  border: 'red',
  borderWidth: 2,
  borderStyle: 'solid',
  padding: 20
},
leftStyle = {
	display: 'inline-block',
	width: '30%',
	'vertical-align': 'top'
},
rightStyle = {
	display: 'inline-block',
	width: '70%',
	'vertical-align': 'top'
},
ulStyle = {
	display: 'block',
	padding: '20px'
}
