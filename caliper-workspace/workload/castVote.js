'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

const CANDIDATES = ['CANDIDATE_BJP', 'CANDIDATE_INC', 'CANDIDATE_AAP'];

class CastVoteWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.voterPool = [];
        this.poolIndex = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        const poolSize = roundArguments.poolSize || 500;
        const batchSize = roundArguments.batchSize || 20;

        console.log(`Worker ${workerIndex}: registering ${poolSize} voters...`);

        for (let i = 0; i < poolSize; i += batchSize) {
            const batch = [];

            for (let j = 0; j < batchSize && (i + j) < poolSize; j++) {
                const voterHashID = `${workerIndex}${crypto.randomBytes(28).toString('hex')}`;
                const randomnessR  = crypto.randomBytes(32).toString('hex');
                batch.push({ voterHashID, randomnessR });
            }

            await Promise.allSettled(
                batch.map(({ voterHashID, randomnessR }) =>
                    this.sutAdapter.sendRequests({
                        contractId: 'voting',
                        contractFunction: 'RegisterVoter',
                        contractArguments: [voterHashID, randomnessR, 'KarnatakaMSP'],
                        timeout: 30
                    }).then(() => this.voterPool.push(voterHashID))
                )
            );
        }

        console.log(`Worker ${workerIndex}: pool size = ${this.voterPool.length}`);
    }

    async submitTransaction() {
        if (this.voterPool.length === 0) return;

        const voterHashID = this.voterPool[this.poolIndex % this.voterPool.length];
        this.poolIndex++;

        const candidate = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];

        await this.sutAdapter.sendRequests({
            contractId: 'voting',
            contractFunction: 'CastVote',
            contractArguments: [voterHashID, candidate],
            timeout: 30
        });
    }

    async cleanupWorkloadModule() {
        this.voterPool = [];
        this.poolIndex = 0;
    }
}

module.exports.createWorkloadModule = () => new CastVoteWorkload();