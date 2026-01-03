const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

async function getContract() {
    const ccpPath = '/home/bhavana/BVS/Blockchain-Voting-System/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // FORCE FIX: Ensure the SDK looks at localhost, not internal docker names
    ccp.peers['peer0.org1.example.com'].url = 'grpcs://localhost:7051';

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    // Inside your getContract function
    await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { 
            enabled: true, 
            asLocalhost: true,
        // SMART FIX: Tell the SDK to ONLY talk to the healthy Org1 Peer
        // This ignores the "Unknown Authority" errors from Org2
            requiredServiceEndpoints: ['peer0.org1.example.com'] 
    }
});

    // Verify channel name spelling here (testchannell vs testchannel)
    const network = await gateway.getNetwork('votingchannel');
    return { contract: network.getContract('basic'), gateway };
}

app.get('/api/votes', async (req, res) => {
    let gateway;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        const result = await connection.contract.evaluateTransaction('GetAllVotes');
        res.json(JSON.parse(result.toString() || '[]'));
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (gateway) await gateway.disconnect();
    }
});

// Add this to server.js if it's missing or different
app.post('/api/votes', async (req, res) => {
    let gateway;
    try {
        const { voterId, candidate, aadhaar } = req.body;
        
        // Use your existing function
        const connection = await getContract(); 
        gateway = connection.gateway;
        const contract = connection.contract;

        // This calls the "CastVote" function in your Go chaincode
        console.log(`Casting vote for: ${voterId}`);
        await contract.submitTransaction('CastVote', voterId, candidate, aadhaar);
        
        res.status(200).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error("POST Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (gateway) await gateway.disconnect();
    }
});
app.post('/api/redact', async (req, res) => {
    let gateway;
    try {
        const { voterId, newCandidate, newRandom } = req.body;
        const connection = await getContract();
        gateway = connection.gateway;

        // This calls the Redact function in your Go chaincode
        // Note: Ensure the function name 'RedactVote' matches your Go code
        await connection.contract.submitTransaction('RedactVote', voterId, newCandidate, newRandom);
        
        res.status(200).json({ message: 'Vote successfully redacted (Chameleon Hash maintained)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (gateway) await gateway.disconnect();
    }
});
app.get('/api/votes/:id', async (req, res) => {
    let gateway;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        const result = await connection.contract.evaluateTransaction('ReadVote', req.params.id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(404).json({ error: "Vote not found" });
    } finally {
        if (gateway) await gateway.disconnect();
    }
});

app.listen(3000, () => console.log('Server running: http://localhost:3000'));