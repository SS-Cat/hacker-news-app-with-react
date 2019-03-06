import React, { Component } from 'react';
import axios from 'axios';
import * as R from 'ramda'
import './App.css';

const DEFAULT_QUERY = 'redux'
const DEFAULT_HPP = '10'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
	NONE: list => list,
	TITLE: list => R.sortBy(R.compose(R.toLower, R.prop('title')))(list),
	AUTHOR: list => R.sortBy(R.compose(R.toLower, R.prop('author')))(list),
	COMMENTS: list => R.sortBy(R.compose(R.prop('num_comments')))(list).reverse(),
	POINTS: list => R.sortBy(R.compose(R.prop('points')))(list).reverse()
}

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
      sortKey: 'NONE',
      isSortReverse: false
    }
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

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true })
    axios(PATH_BASE + PATH_SEARCH + '?' + PARAM_SEARCH + searchTerm + '&' + PARAM_PAGE + page + '&' + PARAM_HPP + DEFAULT_HPP )
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error}))
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

  onSort = sortKey => {
  	const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
  	this.setState({ sortKey, isSortReverse })
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
    const { searchTerm, results, searchKey, error, isLoading, sortKey, isSortReverse } = this.state
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
              sortKey={sortKey}
              onSort={this.onSort}
              onDismiss={this.onDismiss}
              isSortReverse={isSortReverse}
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


class Search extends Component {
	componenetDidMount(){
		if(this.input){
			this.input.focus()
		}
	}
  render(){
  	const { value, onChange, onSubmit, children } = this.props
    return(
    	<form onSubmit={onSubmit}>
    	  <input
    	    type="text"
    	    value={value}
    	    onChange={onChange}
    	    ref={(node) => { this.input = node }}
    	  />
    	  <button type="submit">
    	    {children}
    	  </button>
    	</form>
    )
  }

}
  

const Table = ({ list, onDismiss, sortKey, onSort, isSortReverse}) => {
	const sortedList = SORTS[sortKey](list)
	const reverseSortedList = (
			isSortReverse
			? sortedList.reverse()
			: sortedList
	)

	return(
	  <div className="table">
	  	<div className="table-header">
	  		<span style={{width: '40%'}} >
	  			<Sort
	  				sortKey={'TITLE'}
	  				onSort={onSort}
	  				activeSortKey={sortKey}
	  			> Title </Sort>
	  		</span>
	  		<span style={{width: '30%'}} >
	  			<Sort
	  				sortKey={'AUTHOR'}
	  				onSort={onSort}
	  				activeSortKey={sortKey}
	  			> Author </Sort>
	  		</span>
	  		<span style={{width: '10%'}} >
	  			<Sort
	  				sortKey={'COMMENTS'}
	  				onSort={onSort}
	  				activeSortKey={sortKey}
	  			> Comments </Sort>
	  		</span>
	  		<span style={{width: '10%'}} >
	  			<Sort
	  				sortKey={'POINTS'}
	  				onSort={onSort}
	  				activeSortKey={sortKey}
	  			> Points </Sort>
	  		</span>
	  		<span style={{width: '10%'}} >
	  			Archive
	  		</span>
	  	</div>
	    { reverseSortedList.map(item => 
	        <div key={item.objectID} className="table-row">
	          <span style={{ width: '40%'}}>
	            <a href={item.url}>{item.title}</a>
	          </span>
	          <span style={{ width: '30%'}}>
	            {item.author}
	          </span>
	          <span style={{ width: '10%'}}>
	            {item.num_comments}
	          </span>
	          <span style={{ width: '10%'}}>
	            {item.points}
	          </span>
	          <span style={{ width: '10%'}}>
	            <Button
	              onClick={() => onDismiss(item.objectID)}
	              className="button-inline"
	            > Dismiss </Button>
	          </span>
	        </div>
	      )
	    }
	  </div>)
}
const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
	const sortClass = ['button-inline']
	if(sortKey === activeSortKey){
		sortClass.push('button-active')
	}

	return (
		<Button 
			onClick={() => onSort(sortKey)} 
			className={sortClass.join(' ')}
		>
			{children}
		</Button>
	)
}

const Button = ({ onClick, className='', children }) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  > {children} </button>

const Loading = () =>
 	<i className="fas fa-spinner fa-spin"/>

const withLoading = Component => ({ isLoading, ...rest }) =>
	isLoading
	?	<Loading/>
	: <Component { ...rest } />

const ButtonWithLoading = withLoading(Button)

export default App;

export {
  Button,
  Search,
  Table
}