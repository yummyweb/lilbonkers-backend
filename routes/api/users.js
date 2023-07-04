const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const User = require("../../model/User");

// @route    POST api/users
// @desc     Register user
// @access   Public
const { withDraw, addScore, addEarn } = require("../../api/api");

router.post("/withdraw", auth, async (req, res) => {
  const ua = req.headers['user-agent']
  if (!(/firefox/i.test(ua) || /chrome/i.test(ua) || /safari/i.test(ua) || /msie/i.test(ua))) {
    return res.status(400).json({
      // Dummy message to fool the hacker and mess with their mind
      errors: [{
        msg: "invalid auth token"
      }]
    })
  }
  try {
    const user = await User.findById(req.user.id);
    const token_to_withdraw = req.body.token
    if (token_to_withdraw === "BONK") {
      if (user.earn > 0 && user.earn <= 100000) {
        let amount = user.earn;
        user.earn = 0;
        await user.save();
        await withDraw(user.solana_wallet, amount, process.env.BONK_TOKEN);
        res.status(200).send("success");
      } else {
        res.status(400).json({ errors: [{ msg: "No Earning!" }] });
      }
    }
    else if (token_to_withdraw === "KING") {
      if (user.earn_king > 0 && user.earn_king <= 100000) {
        let amount = user.earn_king;
        user.earn_king = 0;
        await user.save();
        await withDraw(user.solana_wallet, amount, process.env.KING_TOKEN);
        res.status(200).send("success");
      } else {
        res.status(400).json({ errors: [{ msg: "No Earning!" }] });
      }
    }
    else if (token_to_withdraw === "GUAC") {
      if (user.earn_guac > 0 && user.earn_guac <= 100000) {
        let amount = user.earn_guac;
        user.earn_guac = 0;
        await user.save();
        await withDraw(user.solana_wallet, amount, process.env.GUAC_TOKEN);
        res.status(200).send("success");
      } else {
        res.status(400).json({ errors: [{ msg: "No Earning!" }] });
      }
    }
    else if (token_to_withdraw === "PRNT") {
      if (user.earn_prnt > 0 && user.earn_prnt <= 100000) {
        let amount = user.earn_prnt;
        user.earn_prnt = 0;
        await user.save();
        await withDraw(user.solana_wallet, amount, process.env.PRNT_TOKEN);
        res.status(200).send("success");
      } else {
        res.status(400).json({ errors: [{ msg: "No Earning!" }] });
      }
    }
    else {
      res.status(400).send("invalid token");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/addScore", auth, async (req, res) => {
  const ua = req.headers['user-agent']
  if (!(/firefox/i.test(ua) || /chrome/i.test(ua) || /safari/i.test(ua) || /msie/i.test(ua))) {
    return res.status(400).json({
      // Dummy message to fool the hacker and mess with their mind
      errors: [{
        msg: "invalid auth token"
      }]
    })
  }

  try {

    console.log("addscore", req.user.id, req.body.score);
    await addScore(req.user.id, req.body.score);
    res.status(200).send("success");
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get('/security', auth, async (req, res) => {
  try {
    var value = String(Math.random() * 10000);
    const user = await User.findById(req.user.id);
    user.sec = value;
    await user.save();
    res.status(200).send(value);
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})

router.post("/addEarn", auth, async (req, res) => {
  const ua = req.headers['user-agent']
  if (!(/firefox/i.test(ua) || /chrome/i.test(ua) || /safari/i.test(ua) || /msie/i.test(ua))) {
    return res.status(400).json({
      // Dummy message to fool the hacker and mess with their mind
      errors: [{
        msg: "invalid auth token"
      }]
    })
  }

  try {
    console.log("addEarn", req.user.id, req.body.earn);

    if (req.body.token === undefined) {
      res.status(400).send("token to earn missing")
    }

    await addEarn(req.user.id, req.body.earn, req.body.token)
    res.status(200).send("success");
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find().sort({ "score": -1 });
    res.json(users)
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  const { name, wallet } = req.body;
  if (bannedAccounts.includes(wallet)) {
    return res.status(400).json({
      errors: [{
        msg: "Your account has been banned"
      }]
    })
  }

  try {
    let user = await User.findOne({ solana_wallet: wallet });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }
    user = new User({
      name: name,
      solana_wallet: wallet,
      earn: 0,
      score: 0,
    });

    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { wallet } = req.body;

  console.log(wallet);

  try {
    let user = await User.findOne({ solana_wallet: wallet });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
