for (var x = 0; x < 100; x++) { seed = web3.sha3(Math.random().toString()); console.log("'" + seed + "'| " + web3.sha3(seed)); console.log();}