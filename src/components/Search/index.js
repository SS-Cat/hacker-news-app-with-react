import React, { useEffect } from 'react'

function Search({ value, onChange, onSubmit, children }) {
    let onFocus = null

    useEffect(() => {
        if(onFocus){
            onFocus.focus()
        }
    })

    
    return (
        <form onSubmit={onSubmit}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                ref={(node) => { onFocus = node }}
            />
            <button type="submit">
                {children}
            </button>
        </form>
    )
    
}

export default Search