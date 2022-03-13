/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react"
import useSWR from "swr";

const whitelistedAddresses = {
    "0x6cf96b8ea5fc90541a6fedd26568c610c7dec5f1cdb24e169dbadc77688a1b8d": true,
}

export const useAccountHandler = (web3, provider) => () => {

    const { data, mutate, ...rest } = useSWR(
        web3 ? 'web3/accounts' : null,
        async () => {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            if (!account) {
                throw new Error('Cannot retrieve an account. Please refresh the browser!')
            }
            return account;
        }
    )


    //Changing the account without refreshing
    useEffect(() => {
        const mutator = accounts => mutate(accounts[0] ?? null);
        provider?.on('accountsChanged', mutator);

        return () => {
            provider?.removeListener('accountsChanged', mutator);
        }
    }, [provider])

    return {
        data,
        isAdmin: (data && whitelistedAddresses[web3.utils.keccak256(data)]) ?? false,
        mutate,
        ...rest,
    }
}