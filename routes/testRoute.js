app.get("/api/test-key", (req, res) => {
    res.json({ key: process.env.STRIPE_SECRET_KEY });
  });