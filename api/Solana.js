const express = require("express");
const router = express.Router();
const bs58 = require("bs58");
const { getKey } = require("./Key");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
var web3 = require("@solana/web3.js");
var { apis } = require("./api");
const transfer = async (amount, walletAddress) => {
  console.log("--", amount, walletAddress);
  var connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  // Construct a `Keypair` from secret key
  var fromWallet = web3.Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY)
  );
  var toWallet = new web3.PublicKey(walletAddress);
  var myMint = new web3.PublicKey(process.env.TOKEN);

  var myToken = new Token(connection, myMint, TOKEN_PROGRAM_ID, fromWallet);

  var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
  var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(toWallet);

  var transaction = new web3.Transaction().add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      amount * 10 ** 9
    )
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet]
  );
  console.log(signature);
  return signature;
};
router.post("/transfer", async (req, res) => {
  console.log(apis);
  if (
    req.body.key != getKey(apis[req.body.walletAddress], req.body.walletAddress)
  ) {
    res.status(403).send("LOL");
    return;
  }
  try {
    const result = await transfer(req.body.amount, req.body.walletAddress);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(403).send("Error");
  }
});
module.exports = router;
