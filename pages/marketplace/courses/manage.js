import { useAccount, useManageCourses, useNetwork } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { Button, Message } from '@components/ui/common'
import { CourseFilter, ManagedCourseCard } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { normalizeOwnedCourse } from '@utils/normalize'

function ManageCourses() {

    const [email, setEmail] = useState("");
    const [verifiedCourses, setVerifiedCourses] = useState({});
    const [searchedCourse, setSearchedCourse] = useState(null)
    const [filters, setFilters] = useState({ state: 'All' })

    const { account } = useAccount();
    const { network } = useNetwork();
    const { web3, requireInstall, contract } = useWeb3();
    const { manageCourses } = useManageCourses(account);
    const router = useRouter();

    const verifyCourse = (email, { hash, proof }) => {

        if (!email) {
            return;
        }

        const emailHash = web3.utils?.sha3(email);
        const proofToCheck = web3.utils?.soliditySha3(
            { type: 'bytes32', value: emailHash },
            { type: 'bytes32', value: hash },
        );

        if (proof === proofToCheck) {
            setVerifiedCourses({
                [hash]: true,
            });
        } else {
            setVerifiedCourses({
                [hash]: false,
            })
        }

    }

    const activateCourse = async (courseHash) => {
        try {
            await contract.methods.activateCourse(courseHash).send({ from: account.data })
        } catch (err) {
            console.error(err.message)
        }
    }

    const deactivateCourse = async (courseHash) => {
        try {
            await contract.methods.deActivateCourse(courseHash).send({ from: account.data })
        } catch (err) {
            console.error(err.message)
        }
    }

    const searchCourse = async hash => {

        if (!hash) {
            setSearchedCourse(null);
            return;
        }

        const re = /[0-9A-Fa-f]{6}/g;

        if (hash && hash.length === 66 && re.test(hash)) {
            const course = await contract.methods.getCourseByHash(hash).call();

            if (course.owner !== '0x0000000000000000000000000000000000000000') {
                const normalized = normalizeOwnedCourse(web3)({ hash }, course)
                setSearchedCourse(normalized);
                console.log(normalized);
                return;
            }
        }
        setSearchedCourse(null)

    }

    useEffect(() => {
        if ((!account.data || !account.isAdmin || !network.isSupported || requireInstall)
            && (account.hasFirstResponse && network.hasFirstResponse)) {
            router.push('/marketplace');
        }
    }, [account])

    const renderCard = (course, isSearched) => {
        return (
            <ManagedCourseCard
                key={course.id}
                course={course}
                isSearched={isSearched}
            >
                <div className="flex mr-2 relative rounded-md">
                    <input
                        onChange={({ target: { value } }) => setEmail(value)}
                        type="text"
                        name="account"
                        id="account"
                        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide the email!" />
                    <Button onClick={() => {
                        verifyCourse(
                            email,
                            { hash: course.hash, proof: course.proof, }
                        )
                    }}>
                        Verify
                    </Button>
                </div>
                {
                    verifiedCourses[course.hash] &&
                    <Message >
                        Verified!
                    </Message>
                }
                {
                    verifiedCourses[course.hash] == false &&
                    <Message type='danger'>
                        Wrong proof!
                    </Message>
                }
                {course.state === 'Purchased' && <div>
                    <Button
                        onClick={() => activateCourse(course.hash)}
                        className='bg-green-500 hover:bg-green-700 text-white mt-2'
                    >
                        Activate
                    </Button>
                    <Button
                        onClick={() => deactivateCourse(course.hash)}
                        className='bg-red-500 hover:bg-red-700 text-white mx-2 mt-2'>
                        Deactivate
                    </Button>
                </div>}
            </ManagedCourseCard>
        )
    }

    const onFilterSelect = (value) => {
        setFilters({
            state: value
        })
    }

    const filteredCourses = manageCourses.data
        ?.filter((course) => {
            if (filters.state === 'All') {
                return true;
            }
            return course.state === filters.state
        })
        ?.map(course => renderCard(course, false));

    return (
        <>
            <div className="py-4">
                <MarketHeader />
                <CourseFilter
                    onSearchSubmit={searchCourse}
                    onFilterSelect={onFilterSelect}
                />
            </div>

            <section className="grid grid-cols-1">
                {
                    searchedCourse &&
                    <div>
                        <h1 className='text-2xl font-bold p-5'>Searched Course</h1>
                        {renderCard(searchedCourse, true)}
                    </div>
                }
                {
                    <div>
                        <h1 className='text-2xl font-bold p-5'>All Courses</h1>
                        {filteredCourses}
                        {filteredCourses?.length === 0 &&
                            <h1 className='block text-center my-6 text-lg'>
                                No Courses Found!
                            </h1>
                        }
                    </div>
                }
            </section>
        </>
    )
}

export default ManageCourses

ManageCourses.Layout = BaseLayout