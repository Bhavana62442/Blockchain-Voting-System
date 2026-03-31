'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ResultConsistencyWorkload extends WorkloadModuleBase {

    async submitTransaction() {
        await this.sutAdapter.sendRequests({
            contractId: 'voting',
            contractFunction: 'TallyVotes',
            contractArguments: [],
            readOnly: true,
            timeout: 30
        });
    }
}

module.exports.createWorkloadModule = () => new ResultConsistencyWorkload();