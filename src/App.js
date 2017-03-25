import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            get: 'initial this.state',
            user: {
                username: '',
                password: ''
            },
            text: '',
            textFromServer: []
        };
    }

    showTextOnRequest = () => {
        axios.get('/text1').then(res => {
            console.log(res.data.text);
            this.setState({ get: res.data.text });
        });
    };

    handleInputChange = (e) => {
        const name = e.target.name;
        const user = this.state.user;
        user[name] = e.target.value;
        this.setState({ user });
        console.log(this.state.user);
    };
    
    signUp = () => {
        axios({
            method: 'post',
            url: '/register',
            data: this.state.user
        }).then(function(res){
            console.log(res);
        }).catch(err => console.error(err));
    };
    login = () => {
        axios({
            method: 'post',
            url: '/login',
            data: this.state.user
        }).then(function(res){
            console.log(res);
        }).catch(err => console.error(err));
    };
    handleInputChangeText = (e) => {
        this.setState({ text: e.target.value });
    };
    postTextButton2 = () => {
        axios({
            method: 'post',
            url: '/text/new',
            data: { text: this.state.text }
        }).then(function(res){
            console.log(res);
        }).catch(err => console.error(err));
    };
    showTextFromDb = () => {
        let that = this;
        axios.get('/text').then(function(res){
            console.log('res');
            console.log(res);
            that.setState({ textFromServer: res.data.data });
        }).catch(err => console.error(err));
    };

    render() {
        console.log(this.state.textFromServer);
        var list = this.state.textFromServer.map(function(v, i){
            return <li key={i}>{v.text}</li>
        });
        return (
          <div className="app">
              <div>
                  <p>{this.state.get}</p>
                  <ul>
                      {list}
                  </ul>
              </div>
              <div>
                  <button onClick={this.signUp}>sign up</button>
                  <button onClick={this.login}>login</button>
                  <p>username<input onChange={this.handleInputChange} type="text" name="username" /></p>
                  <p>password<input onChange={this.handleInputChange} type="text" name="password"/></p>
              </div>

              <div>
                  <button onClick={this.postTextButton2}>button 2: post to db</button>
                  <p>put some text to save in db</p><input onChange={this.handleInputChangeText} type="text"/>
              </div>
              <div>
                  <button onClick={this.showTextOnRequest}>button 1: show text on simple get request</button>
                  <button onClick={this.showTextFromDb}>button 3: show text from db</button>
              </div>
          </div>
        );
    }
}

export default App;
