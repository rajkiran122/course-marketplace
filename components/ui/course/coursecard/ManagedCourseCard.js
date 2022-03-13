import React from 'react'

const Item = ({ title, value }) => {
    return (
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <div className="text-sm font-medium text-gray-500">
                {title[0].toUpperCase() + title.slice(1)}
            </div>
            <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {title === 'price' ? `${value} ETH` : value}
            </div>
        </div>
    )
}

function ManagedCourseCard({ children, course, isSearched = false }) {
    return (
        <div className={`${isSearched ? 'border-indigo-600' : 'bg-gray-200'} bg-white border shadow overflow-hidden sm:rounded-lg mb-3`}>
            {Object.keys(course).map(key => {
                return (
                    <Item key={key} title={key} value={course[key]} />
                )
            })}
            <div className="bg-white px-4 py-5 sm:px-6">
                {children}
            </div>
        </div>
    )
}

export default ManagedCourseCard