const axios = require('axios').default;
const SHA256 = require('@aws-crypto/sha256-js').Sha256
const defaultProvider = require('@aws-sdk/credential-provider-node').defaultProvider
const HttpRequest = require('@aws-sdk/protocol-http').HttpRequest
const SignatureV4 = require('@aws-sdk/signature-v4').SignatureV4

// define a signer object with AWS service name, credentials, and region
const signer = new SignatureV4({
    credentials: defaultProvider(),
    service: 'managedblockchain-query',
    region: 'us-east-1',
    sha256: SHA256,
});

const queryRequest = async (path, data) => {
    //query endpoint
    let queryEndpoint = `https://managedblockchain-query.us-east-1.amazonaws.com/${path}`;

    // parse the URL into its component parts (e.g. host, path)
    const url = new URL(queryEndpoint);

    // create an HTTP Request object
    const req = new HttpRequest({
        hostname: url.hostname.toString(),
        path: url.pathname.toString(),
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
            host: url.hostname,
        }
    });


    // use AWS SignatureV4 utility to sign the request, extract headers and body
    const signedRequest = await signer.sign(req, { signingDate: new Date() });

    try {
        //make the request using axios
        const response = await axios({...signedRequest, url: queryEndpoint, data: data})

        console.log(response.data)
    } catch (error) {
        console.error('Something went wrong: ', error)
        throw error
    }


}


let methodArg = 'get-token-balance';

let dataArg = {
    // " atBlockchainInstant": {
    //     "time": 1688071493
    // }, // (Optional)
    "ownerIdentifier": {
        "address": "0x02E6C1d540d17BcD8A47596390E9f1d3d25041d1" // 지갑 혹은 컨트랙트 주소
    },
    "tokenIdentifier": {
        // "contractAddress":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE********", //USDC contract address (Optional)
        "network":"ETHEREUM_MAINNET",
        "tokenId": "eth"
    }
}

//Run the query request.
queryRequest(methodArg, dataArg);