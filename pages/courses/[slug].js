import { useAccount, useOwnedCourse } from "@components/hooks/web3";
import { Message } from "@components/ui/common";
import { CourseHero, Curriculum, KeyPoints, Lectures } from "@components/ui/course"
import { BaseLayout } from "@components/ui/layout"
import { getAllCourses } from "@content/courses/fetcher"

export default function Course({ course }) {

    const { account } = useAccount();
    const { ownedCourse } = useOwnedCourse(course, account.data);

    const courseState = ownedCourse.data?.state;

    const isLocked =
        !courseState ||
        courseState === 'Purchased' ||
        courseState === 'Deactivated';

    return (
        <>
            <div className="py-6">
                <CourseHero
                    hasOwner={!!ownedCourse.data}
                    title={course.title}
                    description={course.description}
                    image={course.coverImage}
                />
                <KeyPoints points={course.wsl} />
                {
                    courseState &&
                    <div className="max-w-5xl mx-auto">
                        {courseState === 'Purchased' &&
                            <Message type="warning">
                                Course is purchased and waiting for the activation. Process may take upto 24 hours.
                                <i className="block font-normal">
                                    In case of any questions, please contact info@eincode.com
                                </i>
                            </Message>
                        }
                        {courseState === 'Activated' &&
                            <Message>
                                Filip wishes you happy watching.
                            </Message>
                        }
                        {courseState === 'Deactivated' &&
                            <Message type="danger">
                                Course has been deactivated temporarily, due to incorrect purchase data!
                                <i className="block font-normal">
                                    Please contact info@eincode.com
                                </i>
                            </Message>
                        }
                    </div>
                }
                <Lectures locked={isLocked} courseState={courseState} />
                <Curriculum />
            </div>
        </>
    )
}

Course.Layout = BaseLayout

export function getStaticPaths() {
    const { data } = getAllCourses();

    return {
        paths: data.map(c => ({
            params: {
                slug: c.slug,
            }
        })),
        fallback: false,
    }
}

export function getStaticProps({ params }) {
    const { data } = getAllCourses();

    const course = data.filter(c => c.slug === params.slug)[0];

    return {
        props: {
            course,
        }
    }
}