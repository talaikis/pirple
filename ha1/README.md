# HA #1

Simple API concept.

## Run

```bash
npm i
# Generate certificates
# for production set NODE_ENV = prod
npm run start
```

## Generate certs

```bash
chmod +x keygen.sh
./keygen.sh
```

## Benchmarks

```text
loadtest -c 10 --rps 200 -t 30 --timeout 1000 http://localhost:3000/hello

INFO Completed requests:  4415
INFO Total errors:        0
INFO Total time:          30.004544768 s
INFO Requests per second: 147
INFO Mean latency:        1.8 ms
INFO
INFO Percentage of the requests served within a certain time
INFO   50%      1 ms
INFO   90%      2 ms
INFO   95%      4 ms
INFO   99%      9 ms
INFO  100%      30 ms (longest request)
```
