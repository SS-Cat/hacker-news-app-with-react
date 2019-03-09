import React, { useState } from 'react'
import Sort from './sort'
import Button from './../Button'

import { sortBy, compose, toLower, prop } from 'ramda'

const Table = ({ list, onDismiss }) => {

	const [ isSortReverse, setIsSortReverse ] = useState(false)
	const [ Key, setKey ] = useState('NONE')

	const SORTS = {
		NONE: list => list,
		TITLE: list => sortBy(compose(toLower, prop('title')))(list),
		AUTHOR: list => sortBy(compose(toLower, prop('author')))(list),
		COMMENTS: list => sortBy(compose(prop('num_comments')))(list).reverse(),
		POINTS: list => sortBy(compose(prop('points')))(list).reverse()
	}

	const sortedList = SORTS[Key](list)

	const onSort = sortKey => {
  		const SortReverse = Key === sortKey && !isSortReverse
  		setKey(sortKey)
  		setIsSortReverse(SortReverse)
	}

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
						activeSortKey={Key}
					> Title </Sort>
				</span>
				<span style={{width: '30%'}} >
					<Sort
						sortKey={'AUTHOR'}
						onSort={onSort}
						activeSortKey={Key}
					> Author </Sort>
				</span>
				<span style={{width: '10%'}} >
					<Sort
						sortKey={'COMMENTS'}
						onSort={onSort}
						activeSortKey={Key}
					> Comments </Sort>
				</span>
				<span style={{width: '10%'}} >
					<Sort
						sortKey={'POINTS'}
						onSort={onSort}
						activeSortKey={Key}
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
		</div>
	)
}

export default Table