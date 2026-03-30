#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
npx caliper launch manager \
  --caliper-bind-sut fabric:2.4 \
  --caliper-workspace . \
  --caliper-networkconfig networks/network.yaml \
  --caliper-benchconfig benchmarks/voting-benchmark.yaml \
  2>&1 | tee results/run_${TIMESTAMP}.log
cp report.html results/report_${TIMESTAMP}.html
echo "Results saved to results/report_${TIMESTAMP}.html"
