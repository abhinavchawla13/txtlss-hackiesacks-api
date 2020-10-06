async function webhook(req, res) {
  console.log(req.body);
  return res.send("All good");
}

module.exports = {
  webhook,
};
