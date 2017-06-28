import React, { Component } from 'react';
import SemanticMaps from '../third-party/semanticMaps.react';
import Session from '../third-party/session';

class App extends Component {

    constructor(props) {
        super(props);
        this.favorite_stores = Session('favorite_stores') || [];

        this.getData()
            .then(data => {
                this.favorite_stores.map(store => {
                    data.map(item => {
                        if (store.key === item.key) {
                            item.icon = './images/store_on.png';
                        }
                    });
                });

                this.setData();

                this.forceUpdate();
            });
    }

    setData() {
        setInterval(() => {
            Session('stores', this.data);
            console.log(Session('stores'));
        }, 30000);
    }

    getData() {
        this.data = Session('stores') || [];

        if (this.data.length > 0) {
            console.log(this.data);
            return Promise.resolve();
        }

        return fetch('store_directory.json', {
            accept : 'application/json',
            contentType : 'application/json'
        }).then(response => response.json()).then(data => {
            data.map(item => {
                item.address = item.Address;
                item.title = item.Name;
                item.content = item.Name;
                item.key = item.Name;
                item.callback = this.addFavoriteStore(item);
                item.icon = './images/store.png';
            });

            Session('stores', data);
            this.data = data;
        });
    }

    addFavoriteStore(store) {
        return (map, marker, data) => {
            let added = false,
                idx;

            this.favorite_stores.map((item, index) => {
                if (item.key === store.key) {
                    added = true;
                    idx = index;
                }
            });

            if (!added) {
                this.favorite_stores.push(store);
                marker.setIcon('./images/store_on.png');
            }

            Session('favorite_stores', this.favorite_stores);

            this.forceUpdate();
        };
    }

    removeFavoriteStore(event) {
        let index = parseInt(event.target.getAttribute('data-index'));
        this.favorite_stores.splice(index, 1);
        Session('favorite_stores', this.favorite_stores);
        this.forceUpdate();
        event.preventDefault();
    }

    clearFavoriteStore(event) {
        this.favorite_stores = [];
        Session('favorite_stores', []);
        this.forceUpdate();
        event.preventDefault();
    }

    render() {
        return (
            <div>
                {this.data.length > 0 ? <SemanticMaps apiKey="AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A" zoom="12" lat="19.4326077" lng="-99.133208" landscape='ffffff' road='bbc0c4' water='e9ebed' text='666666' poi='f5f5f5' markers={this.data}/> : ''}
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
};


export default App;
