import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Coursecard({ course, Footer, disabled, state }) {
    return (
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div className="flex h-full">
                <div className="flex-2 h-full ">
                    <Image
                        className={`object-cover rounded-br-lg ${disabled && 'filter grayscale'}`}
                        src={course.coverImage}
                        layout='fixed'
                        width='200'
                        height='240'
                        alt={course.title}
                    />
                </div>
                <div className="p-8 flex-3">
                    <div className='flex items-center'>
                        <div className="uppercase mr-4 tracking-wide text-sm text-indigo-500 font-semibold">
                            {course.type}
                        </div>
                        <div>
                            {
                                state === 'Activated' &&
                                <div className='text-xs text-black bg-green-200 p-1 px-3 rounded-full '>
                                    Activated
                                </div>
                            }
                            {
                                state === 'Deactivated' &&
                                <div className='text-xs text-black bg-red-200 p-1 px-3 rounded-full'>
                                    Deactivated
                                </div>
                            }
                            {
                                state === 'Purchased' &&
                                <div className='animate-pulse text-xs text-black bg-yellow-200 p-1 px-3 rounded-full'>
                                    Pending
                                </div>
                            }
                        </div>
                    </div>
                    <Link href={`/courses/${course.slug}`}>
                        <a className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">{course.title}</a>
                    </Link>
                    <p className="mt-2 text-gray-500">
                        {course.description.substring(0, 80)}...
                    </p>
                    {
                        Footer &&
                        <div className='mt-3'>
                            <Footer />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Coursecard