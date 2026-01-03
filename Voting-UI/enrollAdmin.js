const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const ccpPath = '/home/bhavana/BVS/Blockchain-Voting-System/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(caInfo.url);

        const walletPath = path.join(process.cwd(), 'wallet');
        // Reset wallet
        if (fs.existsSync(walletPath)) {
            fs.rmSync(walletPath, { recursive: true, force: true });
        }
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin and replaced the old wallet.');

    } catch (error) {
        console.error(`Failed to enroll admin: ${error}`);
    }
}
main();