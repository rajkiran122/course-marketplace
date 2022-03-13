import { useAccountHandler as createAccountHook } from "./useAccountHandler";
import { useNetworkHandler as createNetworkHook } from "./useNetworkHandler";
import { useOwnedCoursesHandler as createOwnedCoursesHook } from "./useOwnedCoursesHandler";
import { useOwnedCourseHandler as createOwnedCourseHook } from "./useOwnedCourseHandler";
import { useManageCoursesHandler as createManageCoursesHook } from "./useManageCoursesHandler";

/// ...deps= dependencies
export const setupHooks = ({ web3, provider, contract }) => {
    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3),
        useOwnedCourses: createOwnedCoursesHook(web3, contract),
        useOwnedCourse: createOwnedCourseHook(web3, contract),
        useManageCourses: createManageCoursesHook(web3, contract),
    }
}