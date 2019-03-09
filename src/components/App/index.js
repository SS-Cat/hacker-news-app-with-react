import React, { Component } from 'react';
import axios from 'axios';
import './index.css';

import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP
} from '../../constants'

import Button from './../Button'
import Search from './../Search'
import withLoading from './../Loading'
import Table from './../Table'

const ButtonWithLoading = withLoading(Button)

class App extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    }
  }

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true })
    axios(PATH_BASE + PATH_SEARCH + '?' + PARAM_SEARCH + searchTerm + '&' + PARAM_PAGE + page + '&' + PARAM_HPP + DEFAULT_HPP )
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error}))
  }

  setSearchTopStories = result => {
    const { hits, page } = result
    const { searchKey, results } = this.state

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : []

    const updateHits = [
      ...oldHits,
      ...hits
    ]

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updateHits, page }
      },
      isLoading: false
    })
  }

  onSearchChange = event => {
    this.setState({ searchTerm: event.target.value })
  }

  needsToSearchTopStories = searchTerm => {
    return !(this.state.results && this.state.results[searchTerm])
  }

  onSearchSubmit = event => {
    event.preventDefault()

    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm)
    }

  }

  onDismiss = id => {
    const { searchKey, results } = this.state
    const { hits, page } = results[searchKey]

    const updateHits = hits.filter(item => item.objectID !== id)

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updateHits, page }
      }
    })
  }

	componentDidMount(){
    this._isMounted = true

    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm)
  }

  componenetWillUnmount(){
    this._isMounted = false
  }

  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []
    return(
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          > Search </Search>
        </div>
        { error
          ? <div className="interactions">
              <p>Something went wrong.</p>
            </div>
          : <Table
              list={list}
              onDismiss={this.onDismiss}
            />
        }
        <div className="interactions">
        	<ButtonWithLoading
        		isLoading={isLoading}
        		onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
        	> More </ButtonWithLoading>
        </div>
      </div>      
    )
  }
}

export default App;