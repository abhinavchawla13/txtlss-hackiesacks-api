async function create(req, res) {
  return res.send({ status: "All Good!" });
}

async function webhook(req, res) {
  console.log(req.body);
  return res.send("All good");
}

module.exports = {
  create,
  webhook,
};
