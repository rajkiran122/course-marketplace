import React from 'react'

const SIZE = {
    sm: 'p-2 text-base xs:px-4',
    md: 'p-3 text-base xs:px-8',
    lg: 'p-3 text-lg xs:px-8',
}

function Button({
    isLoading,
    children,
    size = 'md',
    disabled,
    className = 'text-white bg-indigo-600 hover:bg-indigo-700',
    ...rest }) {

    const disabledStyle = 'bg-indigo-100 text-indigo-300 hover:bg-indigo-100 cursor-auto'
    const sizeClass = SIZE[size];

    return (
        <button
            {...rest}
            disabled={isLoading || disabled}
            style={{ cursor: 'pointer' }}
            className={`px-8 py-2 rounded border  font-medium ${sizeClass} ${disabled ? disabledStyle : className}`}>
            {children}
        </button>
    )
}

export default Button