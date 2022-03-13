import Link from 'next/link'
import { useRouter } from 'next/router';
import React from 'react'

function BreadCrumbs({ items }) {

    const { pathname } = useRouter();

    return (
        <nav aria-label="breadcrumb" className="mb-4">
            <ol className="flex leading-none  divide-x divide-indigo-400">
                {items.map((item, i) =>
                    <li key={i} className={`${i === 0 ? 'pr-4' : ''} px-4`}>
                        <Link href={item.href}>
                            <a className={`${pathname === item.href ? 'text-indigo-800 font-medium' : 'text-gray-500 hover:text-indigo-800'} `}>
                                {item.value}
                            </a>
                        </Link>
                    </li>
                )}
            </ol>
        </nav >
    )
}

export default BreadCrumbs