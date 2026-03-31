'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class AuditTrailWorkload extends WorkloadModuleBase {

    async submitTransaction() {
        await this.sutAdapter.sendRequests({
            contractId: 'voting',
            contractFunction: 'GetAllVotes', // or your audit function
            contractArguments: [],
            readOnly: true,
            timeout: 30
        });
    }
}

module.exports.createWorkloadModule = () => new AuditTrailWorkload();