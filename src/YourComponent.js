import React, { Component } from 'react';
import SemanticMaps from './semanticMaps.react';
import Session from './session';



/*
* Use this component as a launching-pad to build your functionality.
*
*/

export default class YourComponent extends Component {

    constructor(props) {
        super(props);
        this.data = [];
        this.favorite_stores = Session('stores') || [];
        this.stores = [];
        fetch('store_directory.json', {
            accept : 'application/json',
            contentType : 'application/json'
        }).then(response => response.json()).then(data => {
            for (let i in data) {
                data[i].address = data[i].Address;
                data[i].title = data[i].Name;
                data[i].content = data[i].Name;
                data[i].key = data[i].Name;
                data[i].callback = this.addFavoriteStore(data[i]);
                data[i].icon = './store.png';
            }
            this.data = data;
            this.forceUpdate();
        });
    }

    addFavoriteStore(store) {
        return (map, marker, data) => {
            let added = false;
            this.favorite_stores.map(item => {
                if (item.key === store.key) {
                    added = true;
                }
            });

            if (!added) {
                this.favorite_stores.push(store);
                Session('stores', this.favorite_stores);
            }

            this.forceUpdate();
        };
    }

    removeFavoriteStore(event) {
        let index = parseInt(event.target.getAttribute('data-index'));
        this.favorite_stores.splice(index, 1);
        Session('stores', this.favorite_stores);
        this.forceUpdate();
        event.preventDefault();
    }

    clearFavoriteStore(event) {
        this.favorite_stores = [];
        Session('stores', []);
        this.forceUpdate();
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={this.data}/>
                <div data-grid="gutters">
                    <div data-column="xs-12 sm-4">
                        <section data-card="full-width">
                            <header><h1> My favorite stores!</h1></header>
                            <section>
                                <ul data-list="three-line">
                                    {this.favorite_stores.map((store, i) => {
                                        return <li key={store.key}>
                                            <span>
                                                <span>{store.title}</span>
                                                <small>{store.address}</small>
                                            </span>
                                            <a href="#" tabIndex="-1" data-index={i} onClick={this.removeFavoriteStore.bind(this)}>
                                                <i data-font="danger" className="material-icons">delete</i>
                                            </a>
                                        </li>;
                                    })}
                                </ul>
                            </section>
                            <footer>
                                <nav>
                                    <button data-button="danger" onClick={this.clearFavoriteStore.bind(this)}>Clear</button>
                                </nav>
                            </footer>
                        </section>
                    </div>
                </div>
            </div>
        );
    }
}
