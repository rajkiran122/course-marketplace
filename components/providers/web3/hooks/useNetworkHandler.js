/* eslint-disable react-hooks/rules-of-hooks */
import useSWR from "swr"

const NETWORKS = {
    1: 'Ethereum Main Network',
    3: 'Ropsten Test Network',
    4: 'Rinkeby Test Network',
    5: 'Goerli Test Network',
    42: 'Kovan Test Network',
    56: 'Binance Smart Chain',
    1337: 'Ganache'
}

const targetNetwork = NETWORKS[process.env.NEXT_PUBLIC_TARGET_CHAIN_ID];

export const useNetworkHandler = web3 => () => {

    const { data, error, ...rest } = useSWR(
        web3 ? 'web3/network' : null,
        async () => {
            const chainId = await web3.eth.getChainId();

            if (!chainId) {
                throw new Error('Cannot retrieve network. Please refresh the browser!')
            }
            return NETWORKS[chainId];
        }
    )

    // useEffect(() => {
    //     // const mutator = chainId => mutate(NETWORKS[parseInt(chainId, 16)]);
    //     const mutator = chainId => window.location.reload();
    //     provider?.on('chainChanged', mutator);

    //     return () => {
    //         provider?.removeListener('chainChanged', mutator);
    //     }
    // }, [provider])

    return {
        data,
        target: targetNetwork,
        isSupported: data === targetNetwork,
        ...rest,
    }

}