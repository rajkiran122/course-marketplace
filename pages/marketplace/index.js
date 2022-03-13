import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Loader } from "@components/ui/common";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { OrderModal } from "@components/ui/order";
import { getAllCourses } from "@content/courses/fetcher";
import { withToast } from "@utils/toast";
import { useState } from "react";

export default function MarketPlace({ courses }) {

    const { web3, contract, requireInstall } = useWeb3();
    const { hasConnectedWallet, account, isConnecting } = useWalletInfo();
    const { ownedCourses } = useOwnedCourses(courses, account.data);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isNewPurchase, setIsNewPurchase] = useState(true);
    const [busyCourse, setBusyCourse] = useState(null)

    const purchaseCourse = async (order, course) => {
        const hexCourseId = web3.utils.utf8ToHex(course.id);
        const orderHash = web3.utils.soliditySha3(
            { type: 'bytes16', value: hexCourseId, },
            { type: 'address', value: account.data }
        );

        const price = web3.utils.toWei(String(order.price));

        setBusyCourse(course.id)

        if (isNewPurchase) {
            const emailHash = web3.utils.sha3(order.email);
            const proof = web3.utils.soliditySha3(
                { type: 'bytes32', value: emailHash },
                { type: 'bytes32', value: orderHash },
            );

            withToast(_purchaseCourse({ hexCourseId, proof, price }, course));
        } else {
            withToast(_repurchaseCourse({ courseHash: orderHash, price }, course));
        }
    }

    const _purchaseCourse = async ({ hexCourseId, proof, price }, course) => {
        try {
            const result = await contract.methods.purchaseCourse(
                hexCourseId,
                proof,
            ).send({
                from: account.data,
                value: price,
            });
            console.log(result);

            ownedCourses.mutate([
                ...ownedCourses.data,
                {
                    ...course,
                    proof,
                    state: 'Purchased',
                    owner: account.data,
                    price,
                }
            ])

            return result
        } catch (error) {
            throw new Error(error.message)
        } finally {
            setBusyCourse(null)
        }
    }

    const _repurchaseCourse = async ({ courseHash, price }, course) => {
        try {
            const result = await contract.methods.repurchaseCourse(
                courseHash,
            ).send({
                from: account.data,
                value: price,
            });

            return result
        } catch (error) {
            throw new Error(error.message)
        } finally {
            setBusyCourse(null)
        }
    }

    return (
        <>

            <MarketHeader />
            <CourseList courses={courses}>
                {

                    course => {

                        const owned = ownedCourses.lookup[course.id];

                        return (
                            <CourseCard
                                key={course.id}
                                course={course}
                                disabled={!hasConnectedWallet}
                                state={owned?.state}
                                Footer={() => {

                                    if (requireInstall) {
                                        return (
                                            <Button
                                                className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                disabled={true}>
                                                Install
                                            </Button>
                                        )
                                    }

                                    if (isConnecting || !ownedCourses.hasFirstResponse) {
                                        return (
                                            <Loader />
                                        )
                                    }


                                    if (owned) {
                                        return (
                                            <>
                                                <Button
                                                    disabled={false}
                                                    className='text-black'
                                                >
                                                    Yours &#10003;
                                                </Button>
                                                {owned.state === 'Deactivated' &&
                                                    <Button
                                                        className='ml-2 text-white bg-green-600 hover:bg-green-700'
                                                        onClick={() => {
                                                            setIsNewPurchase(false);
                                                            setSelectedCourse(course);
                                                        }}>
                                                        Fund to Activate
                                                    </Button>
                                                }
                                            </>
                                        )
                                    }

                                    const isBusy = busyCourse === course.id;

                                    return (
                                        <Button
                                            className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200 "
                                            onClick={() => setSelectedCourse(course)}
                                            disabled={!hasConnectedWallet || isBusy}>
                                            {isBusy ?
                                                <div className="flex items-center">
                                                    <Loader />
                                                    <div className="ml-4">In Progress</div>
                                                </div> :
                                                'Purchase'
                                            }
                                        </Button>
                                    )
                                }
                                }
                            />
                        )
                    }
                }
            </CourseList>
            {
                selectedCourse &&
                <OrderModal
                    isNewPurchase={isNewPurchase}
                    course={selectedCourse}
                    onSubmit={purchaseCourse}
                    onClose={() => {
                        setSelectedCourse(null);
                        setIsNewPurchase(true);
                    }}
                />
            }
        </>
    )
}

export function getStaticProps() {
    const { data } = getAllCourses();
    return {
        props: {
            courses: data,
        }
    }
}

MarketPlace.Layout = BaseLayout
