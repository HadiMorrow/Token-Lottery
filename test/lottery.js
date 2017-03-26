var HMLottery = artifacts.require("./HMLottery.sol");
var ExampleToken = artifacts.require("./ExampleToken.sol");

contract('HMLottery', accounts => {
  it("should have some variables setup from the initialization", () => {
    var lottery;
    var lotteryMin;
    var lotteryMax;
    var lotteryHashedSeed;

    return HMLottery.deployed().then(instance => {
      lottery = instance;

      return lottery.minimumBet.call();
    }).then(minBet => {
      lotteryMin = minBet.toNumber();
      return lottery.maximumBet.call();
    }).then(maxBet => {
      lotteryMax = maxBet.toNumber();
      return lottery.hashedSeeds(0);
    }).then(hashedSeed => {
      lotteryHashedSeed = hashedSeed.toString();
    }).then(() => {
      assert.equal(lotteryMin, 100, "Minimum bet should be 100");
      assert.equal(lotteryMax, 500, "Maximum bet should be 500");
      assert.equal(lotteryHashedSeed,
                   "0x3864c58f7d209779faecf99a6441c6687ccbd5c98639a4f17753434199b095b3", 
                   "Should be the same");
    });
  });
  it("none of these bets should go through", () => {
    var lottery;

    return HMLottery.deployed().then(instance => {
      lottery = instance;

      return lottery.placeBet(1, 2, 3, 4, 50);  // ammount too low
    }).then(() => {
      return lottery.placeBet(1, 2, 3, 4, 550); // ammount too high
    }).then(() => {
      return lottery.placeBet(1, 1, 3, 4, 150); // all balls are not unique
    }).then(() => {
      return lottery.testBetsLength.call();
    }).then(testBetsLength => {
      assert.equal(0, testBetsLength, "There should be no bets in the list");
    });
  });
  it("all of these bets should go through", () => {
    var lottery;
    var token;
    var playerTokens;
    var lotteryTokens;

    return HMLottery.deployed().then(instance => {
      lottery = instance;
      return ExampleToken.deployed();
    }).then(instance => {
      token = instance;

      // give the second user account some tokens to be able to gamble
      return token.transfer(accounts[1], 10000);
    }).then(() => {
      // give the lottery contract permission to spend second users tokens
      return token.approve(lottery.address, 10000, {from: accounts[1]});
    }).then(() => {
      return lottery.setToken(token.address);
    }).then(() => {
      return lottery.placeBet(1, 2, 3, 4, 150, {from: accounts[1]});
    }).then(() => {
      return token.balanceOf.call(accounts[1]);
    }).then(balance => {
      playerTokens = balance.toNumber();
      return token.balanceOf.call(lottery.address);
    }).then(balance => {
      lotteryTokens = balance.toNumber();
      return lottery.testBetsLength.call();
    }).then(testBetsLength => {
      assert.equal(1, testBetsLength, "There should be one bet in the list");
      assert.equal(10000 - 150, playerTokens, "Player should have 150 less tokens now")
      assert.equal(150, lotteryTokens, "Lottery should have 150 tokens now")
    }).then(() => {
      return lottery.placeBet(255, 254, 253, 252, 250, {from: accounts[1]});
    }).then(() => {
      return token.balanceOf.call(accounts[1]);
    }).then(balance => {
      playerTokens = balance.toNumber();
      return token.balanceOf.call(lottery.address);
    }).then(balance => {
      lotteryTokens = balance.toNumber();
      return lottery.testBetsLength.call();
    }).then(testBetsLength => {
      assert.equal(2, testBetsLength, "There should be two bets in the list");
      assert.equal(10000 - 150 - 250, playerTokens, "Player should have less tokens now")
      assert.equal(150 + 250, lotteryTokens, "Lottery should have 400 tokens now")
      return lottery.testReturnBet.call(0);
    }).then((bet) => {
      assert.equal(accounts[1], bet[0], "player should be account[1]");
      assert.equal(150, bet[1], "1st bet should have 150");
      assert.equal(1, bet[2], "number 1");
      assert.equal(2, bet[3], "number 2");
      assert.equal(3, bet[4], "number 3");
      assert.equal(4, bet[5], "number 4");
      assert.equal(0, bet[6], "ratioIndex should be the 1st one (0)");
      assert.equal(0, bet[8], "rollIndex should be the 1st one (0)");
      assert.equal(0, bet[9], "winAmmount should be 0");
      return lottery.testReturnBet.call(1);
    }).then((bet) => {
      assert.equal(accounts[1], bet[0], "player should be account[1]");
      assert.equal(250, bet[1], "2nd bet should have 250");
      assert.equal(255, bet[2], "number 1");
      assert.equal(254, bet[3], "number 2");
      assert.equal(253, bet[4], "number 3");
      assert.equal(252, bet[5], "number 4");
      assert.equal(0, bet[6], "ratioIndex should be the 1st one (0)");
      assert.equal(0, bet[8], "rollIndex should be the 1st one (0)");
      assert.equal(0, bet[9], "winAmmount should be 0");
      console.log("hello");
    });
  });
  //it("rollNumbers twice and print out the combinations to console of 1st roll", () => {
  //  var lottery;

  //  return HMLottery.deployed().then(instance => {
  //    lottery = instance;
      
   //   return rollNumbers(0xffbb099e3fe006320be2598862d6729d89a08cac02b11c45b33901ab9fbb5fc3,
   //                      0xc65898477ca7d1ae27446f371c1f8de27ce25193268e20c9a46032489614f59b)
   // });//.then(instance => {

    //});
  //});
});

