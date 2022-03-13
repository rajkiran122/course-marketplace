import { useWeb3 } from '@components/providers'
import Link from 'next/link'
import React from 'react'
import { Button } from '@components/ui/common'
import { useAccount } from '@components/hooks/web3'
import { useRouter } from 'next/router'

const NAV_LINKS = [
    {
        href: '/',
        value: 'Home',
    },
    {
        href: '/marketplace',
        value: 'Marketplace',
    },
    {
        href: '/blogs',
        value: 'Blogs',
    },
    {
        href: '/wishlist',
        value: 'Wishlist',
    },
]

function Navbar() {

    const { connect, isInitialized, requireInstall } = useWeb3()

    const { account } = useAccount();
    const { pathname } = useRouter();

    return (
        <section>
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
                <nav className="relative" aria-label="Global">
                    <div className="flex justify-between">
                        <div>
                            {NAV_LINKS.slice(0, 3).map((link, i) =>
                                <Link key={i} href={link.href}>
                                    <a className={`${pathname === link.href ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-900'} font-medium mr-8`}>{link.value}</a>
                                </Link>
                            )}
                        </div>
                        <div>
                            <Link href={NAV_LINKS[NAV_LINKS.length - 1].href}>
                                <a className={`${pathname === NAV_LINKS[NAV_LINKS.length - 1].href ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-900'} font-medium mr-8`}>
                                    {NAV_LINKS[NAV_LINKS.length - 1].value}
                                </a>
                            </Link>
                            {
                                !isInitialized ?
                                    <Button className='opacity-50' isLoading={!isInitialized}>
                                        Loading...
                                    </Button> :
                                    account.data ?
                                        <Button >
                                            Hi, There {account.isAdmin && 'Admin'}👋
                                        </Button> :
                                        requireInstall ?
                                            <Button target='_blank' onClick={() => {
                                                window.open('https://metamask.io/download/', '_blank')
                                            }}
                                                className='hover:text-indigo-800'
                                            >
                                                Install Metamask
                                            </Button> :
                                            <Button onClick={connect}>
                                                Connect
                                            </Button>

                            }
                        </div>
                    </div>
                </nav>
            </div >
            {
                (account.data && !pathname.includes('/marketplace')) &&
                <div className='flex justify-end pt-1 sm:px-6 lg:px-8'>
                    <div className="text-white bg-indigo-600 rounded-md p-2">
                        {account.data}
                    </div>
                </div>
            }
        </section >
    )
}

export default Navbar