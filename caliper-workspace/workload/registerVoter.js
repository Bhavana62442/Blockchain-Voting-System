'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

class RegisterVoterWorkload extends WorkloadModuleBase {
    async submitTransaction() {
        // Generate values guaranteed to be < N (use 30 bytes so always < 32-byte N)
        const voterHashID = crypto.randomBytes(32).toString('hex');  // 64 chars
const randomnessR = crypto.randomBytes(32).toString('hex');  // 64 chars

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
