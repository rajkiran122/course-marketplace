import { useHooks } from "@components/providers/web3"

const _isEmpty = data => {
    return (
        data == null ||
        data === '' ||
        (Array.isArray(data) && data.length === 0) ||
        (data.contructor === Object && Object.keys(data).length === 0)
    )
}

const enhanceHook = (swrRes) => {

    const { data, error } = swrRes;
    const hasFirstResponse = !!(data || error);
    const isEmpty = hasFirstResponse && _isEmpty(data);

    return {
        ...swrRes,
        isEmpty,
        hasFirstResponse: swrRes.data || swrRes.error
    }
}

export const useAccount = () => {
    const swrRes = enhanceHook(useHooks(hooks => hooks.useAccount()));
    return {
        account: swrRes,
    }
}

export const useNetwork = () => {
    const swrRes = enhanceHook(useHooks(hooks => hooks.useNetwork()));
    return {
        network: swrRes,
    }
}

export const useOwnedCourses = (...args) => {
    const res = enhanceHook(useHooks(hooks => hooks.useOwnedCourses(...args)));
    return {
        ownedCourses: res,
    }
}

export const useOwnedCourse = (...args) => {
    const res = enhanceHook(useHooks(hooks => hooks.useOwnedCourse(...args)));
    return {
        ownedCourse: res,
    }
}

export const useManageCourses = (...args) => {
    const res = enhanceHook(useHooks(hooks => hooks.useManageCourses(...args)));
    return {
        manageCourses: res,
    }
}

export const useWalletInfo = () => {
    const { account } = useAccount();
    const { network } = useNetwork();

    const isConnecting = !account.hasFirstResponse && !network.hasFirstResponse;

    return {
        account,
        network,
        isConnecting,
        hasConnectedWallet: !!(account.data && network.isSupported),
    }
}