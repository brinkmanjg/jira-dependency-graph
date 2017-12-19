import React, { Component } from 'react'
import { render } from 'react-dom'
import axios from 'axios'
const mermaidAPI = require('mermaid')
import transformIssuesToMermaid from './jira-mermaid'

import './style.scss';

mermaidAPI.initialize({ startOnLoad: false })

class Root extends Component {
   constructor(props) {
      super(props)

      this.state = {
         epicLink: 'NIM-25',
         errorText: ''
      }

      this.handleEpicChange = this.handleEpicChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
   }

   handleEpicChange(event) {
      this.setState({ epicLink: event.target.value })
   }

   handleSubmit(event) {
      axios.get(`/api/getIssues?epic=${this.state.epicLink}`)
         .then(result => mermaidAPI.render('Test', transformIssuesToMermaid(result.data)))
         .then(_ => this.forceUpdate())
         .catch(err => console.log(err))
      event.preventDefault()
   }

   render() {
      return (
         <div>
            <div className='error-text'>{this.state.errorText}</div>
            <form onSubmit={this.handleSubmit}>
               <label>
                  Epic Issue Key:
            <input type='text' value={this.state.epicLink} onChange={this.handleEpicChange} />
               </label>
               <input type="submit" value="Submit" />
            </form>
            <div id="dTest"></div>
         </div>
      )
   }
}

render(<Root />, document.getElementById('app'))