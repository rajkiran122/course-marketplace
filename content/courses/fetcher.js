import courses from './index.json'

export const getAllCourses = () => {
    return {
        data: courses,
        courseMap: courses.reduce((accumulator, course, index) => {
            accumulator[course.id] = course;
            accumulator[course.id].index = index;

            return accumulator;
        }, {})
    }
}