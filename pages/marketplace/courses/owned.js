import { useAccount, useOwnedCourses, useWalletInfo } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { Button, Loader, Message } from '@components/ui/common'
import { OwnedCourseCard } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import { getAllCourses } from '@content/courses/fetcher'
import Link from 'next/link'
import React from 'react'

function OwnedCourses({ courses }) {

    const { requireInstall } = useWeb3()
    const { account } = useAccount();
    const { ownedCourses } = useOwnedCourses(courses, account.data);

    return (
        <>
            <MarketHeader />
            <section className='grid grid-cols-1'>
                {
                    !ownedCourses?.hasFirstResponse &&
                    <div className='flex justify-center mt-4'>
                        <Loader />
                    </div>
                }
                {
                    ownedCourses?.isEmpty &&
                    <div className='flex justify-center mt-4'>
                        No courses purchased yet!
                        <Link href='/marketplace'>
                            <a className='text-indigo-700 font-medium cursor-pointer'>
                                Purchase Now
                            </a>
                        </Link>
                    </div>
                }
                {
                    account.isEmpty &&
                    <div className='flex justify-center mt-4'>
                        Please connect to Metamask!
                    </div>
                }
                {
                    requireInstall &&
                    <div className='flex justify-center mt-4'>
                        <a onClick={() => {
                            window.open('https://metamask.io/download/', "blank")
                        }} className='text-indigo-700 font-medium cursor-pointer'>
                            Please install Metamask!
                        </a>
                    </div>
                }
                {
                    ownedCourses.data?.map(course => (
                        <OwnedCourseCard course={course} key={course.id}>
                            <Button>
                                Watch the course
                            </Button>
                        </OwnedCourseCard>)
                    )
                }

            </section>
        </>
    )
}

export default OwnedCourses

export function getStaticProps() {
    const { data } = getAllCourses();
    return {
        props: {
            courses: data,
        }
    }
}

OwnedCourses.Layout = BaseLayout
