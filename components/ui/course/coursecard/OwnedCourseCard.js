import React from 'react'

function OwnedCourseCard({ children, course }) {
    return (
        <div className="bg-white border shadow overflow-hidden sm:rounded-lg mb-3">
            <div className="px-4 py-5 sm:px-6">
                <div className="text-lg leading-6 font-medium flex text-gray-900">
                    <h2 className='display-inline'>{course.title}</h2>
                    <span className={`ml-2 rounded-2xl br-20 p-1 px-3 
                    ${course.state === 'Purchased' ? 'bg-violet-300 text-violet-900' :
                            course.state === 'Deactivated' ? 'bg-red-300 text-red-900' :
                                course.state === 'Activated' ? 'bg-green-300 text-green-900' : ''} text-xs flex items-center justify-center`}>
                        {course.state}
                    </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {course.price} ETH
                </p>
            </div>

            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                            Course ID
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {course.ownedCourseId}
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                            Proof
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {course.proof}
                        </dd>
                    </div>

                    <div className="bg-white px-4 py-5 sm:px-6">
                        {children}
                    </div>
                </dl>

            </div>
        </div>
    )
}

export default OwnedCourseCard