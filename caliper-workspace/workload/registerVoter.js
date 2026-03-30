'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

class RegisterVoterWorkload extends WorkloadModuleBase {
    async submitTransaction() {
        // Generate values guaranteed to be < N (use 30 bytes so always < 32-byte N)
        const voterHashID = '00' + crypto.randomBytes(30).toString('hex');
        const randomnessR  = '00' + crypto.randomBytes(30).toString('hex');

        const request = {
            contractId: 'voting',
            contractFunction: 'RegisterVoter',
            contractArguments: [voterHashID, randomnessR, 'KarnatakaMSP'],
            timeout: 30
        };
        await this.sutAdapter.sendRequests(request);
    }
}

module.exports.createWorkloadModule = () => new RegisterVoterWorkload();
