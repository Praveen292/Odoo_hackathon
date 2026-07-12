import React from 'react'

export default function Button({children, className='', ...rest}){
	return (
		<button className={`btn ${className}`} {...rest}>{children}</button>
	)
}

