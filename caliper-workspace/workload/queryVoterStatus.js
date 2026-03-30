'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

class QueryVoterStatusWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.voterPool = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // Register some voters to query
        for (let i = 0; i < 20; i++) {
            const voterHashID = '00' + crypto.randomBytes(30).toString('hex');
            const randomnessR  = '00' + crypto.randomBytes(30).toString('hex');
            try {
                await this.sutAdapter.sendRequests({
                    contractId: 'voting',
                    contractFunction: 'RegisterVoter',
                    contractArguments: [voterHashID, randomnessR, 'KarnatakaMSP'],
                    timeout: 30
                });
                this.voterPool.push(voterHashID);
            } catch (err) {}
        }
    }

    async submitTransaction() {
        if (this.voterPool.length === 0) return;
        const voterHashID = this.voterPool[Math.floor(Math.random() * this.voterPool.length)];
        await this.sutAdapter.sendRequests({
            contractId: 'voting',
            contractFunction: 'QueryVoterStatus',
            contractArguments: [voterHashID],
            readOnly: true,
            timeout: 30
        });
    }
}

module.exports.createWorkloadModule = () => new QueryVoterStatusWorkload();
