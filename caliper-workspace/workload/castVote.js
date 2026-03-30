'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

const CANDIDATES = ['CANDIDATE_BJP', 'CANDIDATE_INC', 'CANDIDATE_AAP'];

class CastVoteWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.voterPool = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // Pre-register a pool of voters for this worker
        console.log(`Worker ${workerIndex}: pre-registering voter pool...`);
        for (let i = 0; i < 25; i++) {
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
            } catch (err) {
                // skip duplicates
            }
        }
        console.log(`Worker ${workerIndex}: pool size = ${this.voterPool.length}`);
    }

    async submitTransaction() {
        if (this.voterPool.length === 0) return;
        const voterHashID = this.voterPool.pop();
        const candidate = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];

        await this.sutAdapter.sendRequests({
            contractId: 'voting',
            contractFunction: 'CastVote',
            contractArguments: [voterHashID, candidate],
            timeout: 30
        });
    }
}

module.exports.createWorkloadModule = () => new CastVoteWorkload();
