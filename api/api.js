var web3 = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const bs58 = require("bs58");
const User = require("../model/User");

const addEarn = async (userId, earn, token) => {
  try {
    const user = await User.findById(userId);
    // Checking which token to earn
    // REMEMBER: `user.earn` is only for tracking $BONK token
    if (token === "BONK") {
      user.earn = user.earn ? user.earn : 0
      user.earn = user.earn + earn;
      if (user.earn > 100000) user.earn = 100000;
    }
    else if (token === "KING") {
      user.earn_king = user.earn_king ? user.earn_king : 0
      user.earn_king = Math.round((user.earn_king + earn) * 1000) / 1000;
      if (user.earn_king > 100000) user.earn_king = 100000;
    }
    else if (token === "GUAC") {
      user.earn_guac = user.earn_guac ? user.earn_guac : 0
      user.earn_guac = Math.round((user.earn_guac + earn) * 1000) / 1000;
      if (user.earn_guac > 100000) user.earn_guac = 100000;
    }
    else if (token === "PRNT") {
      user.earn_prnt = user.earn_prnt ? user.earn_prnt : 0
      user.earn_prnt = Math.round((user.earn_prnt + earn) * 1000) / 1000;
      if (user.earn_prnt > 100000) user.earn_prnt = 100000;
    }
    else {
      return
    }

    await user.save();
  } catch (err) {
    console.error(err.message);
  }
};

const addScore = async (userId, score) => {
  try {
    const user = await User.findById(userId);
    user.score = score;
    await user.save();
  } catch (err) {
    console.error(err.message);
  }
}

const withDraw = async (walletAddress, tamount, tokenPublicKey) => {
  console.log(walletAddress, tamount);
  let amount = tamount;
  var connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  // Construct a `Keypair` from secret key
  var fromWallet = web3.Keypair.fromSecretKey(
    bs58.decode(process.env.DEPOSIT)
  );
  var toWallet = new web3.PublicKey(walletAddress);
  var myMint = new web3.PublicKey(tokenPublicKey);

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
      amount * 10 ** 5
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
module.exports = {
  addEarn,
  addScore,
  withDraw,
};
