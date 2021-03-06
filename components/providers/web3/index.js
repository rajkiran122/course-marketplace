const { createContext, useContext, useEffect, useState, useMemo } = require("react");
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "@utils/loadContract";
import Web3 from "web3";
import { setupHooks } from "./hooks/setupHooks";

const Web3Context = createContext(null);

const setListeners = provider => {
    provider.on('chainChanged', _ => window.location.reload());
}

export default function Web3Provider({ children }) {

    const [web3Api, setWeb3Api] = useState({
        provider: null,
        web3: null,
        isInitialized: false,
        contract: null,
    });

    useEffect(() => {
        const loadProvider = async () => {
            const provider = await detectEthereumProvider();
            if (provider) {
                const web3 = new Web3(provider);
                const contract = await loadContract('CourseMarketplace', web3);

                setListeners(provider);

                setWeb3Api({
                    provider,
                    web3,
                    isInitialized: true,
                    contract,
                });


            } else {
                setWeb3Api(api => ({ ...api, isInitialized: true }));
                console.error('Please install Metamask!');
            }
        }

        loadProvider()
    }, [])

    const _web3Api = useMemo(() => {

        const { web3, provider, isInitialized, contract } = web3Api;

        return {
            ...web3Api,
            requireInstall: isInitialized && !web3,
            getHooks: () => setupHooks({ web3, provider, contract }),
            connect: provider ?
                async () => {
                    try {
                        await provider.request({ method: 'eth_requestAccounts' });
                    } catch {
                        location.reload();
                    }
                } :
                () => console.error('Cannot connect to Metamask, try reloading your browser please!')
        }
    }, [web3Api])

    return (
        <Web3Context.Provider value={_web3Api}>
            {children}
        </ Web3Context.Provider >
    )
}

export function useWeb3() {
    return useContext(Web3Context);
}

export function useHooks(callback) {
    const { getHooks } = useWeb3();
    const hooks = getHooks();

    return callback(hooks);
}

