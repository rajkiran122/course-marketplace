const NEXT_PUBLIC_NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (name, web3) => {
    const res = await fetch(`/contracts/${name}.json`)
    const Artifact = await res.json();

    let contract = null;

    try {
        contract = new web3.eth.Contract(
            Artifact.abi,
            Artifact.networks[NEXT_PUBLIC_NETWORK_ID].address,
        );
    } catch {
        console.error(`Contract ${name} can't be loaded!`);
    }
    return contract;
}