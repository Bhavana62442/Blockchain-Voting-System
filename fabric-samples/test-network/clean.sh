# Go to the network folder
cd fabric-samples/test-network

# 1. Clear old data
./network.sh down
docker volume rm $(docker volume ls -q)

# 2. Start Network + Channel + CA
./network.sh up createChannel -c votingchannel -ca

# 3. Deploy Chaincode
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go/ -ccl go -c votingchannel