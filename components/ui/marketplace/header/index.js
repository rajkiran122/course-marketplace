import { useAccount, useNetwork } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { BreadCrumbs } from '@components/ui/common'
import { EthRates, WalletBar } from '@components/ui/web3'
import React from 'react'

const LINKS = [
    {
        value: 'Buy',
        href: '/marketplace'
    },
    {
        value: 'My Courses',
        href: '/marketplace/courses/owned'
    },
    {
        value: 'Manage Courses',
        href: '/marketplace/courses/manage'
    }
]

function Header() {
    const { account } = useAccount();
    const { network } = useNetwork();
    const { requireInstall } = useWeb3();
    return (
        <div className="py-4">
            <WalletBar />
            <EthRates />
            <div className="flex flex-row-reverse">
                <BreadCrumbs items={
                    (!account.data || !account.isAdmin ||
                        !network.isSupported || requireInstall) ?
                        LINKS.slice(0, 2) : LINKS
                } />
            </div>
        </div>
    )
}

export default Header