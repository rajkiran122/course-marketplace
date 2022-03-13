export const COURSE_STATS = {
    0: 'Purchased',
    1: 'Activated',
    2: 'Deactivated',
}

export const normalizeOwnedCourse = web3 => (course, ownedCourse) => {
    return {
        ...course,
        ownedCourseId: ownedCourse.id,
        proof: ownedCourse.proof,
        owner: ownedCourse.owner,
        price: web3.utils.fromWei(ownedCourse.price),
        state: COURSE_STATS[ownedCourse.state]
    }
}