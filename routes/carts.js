const express = require("express");
const cartsRepo = require("../repositories/carts.js");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

// Receive POST request to add an item to a cart
router.post("/cart/products", async (req, res) => {
  // Figure out the cart!
  let cart;
  if (!req.session.cartId) {
    // User has no card, create one and store on the req.session
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // User has c cart, get it from carts repo
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  const existingItem = cart.items.find(item => item.id === req.body.productId);
  if (existingItem) {
    // Either increment quantity for product existing in cart
    existingItem.quantity++;
  } else {
    // Or add new product id to items array
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  await cartsRepo.update(cart.id, {
    items: cart.items
  });

  res.redirect("/cart");
});

// Receive GET request to show all items in cart
router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);
    //app found product item to item property
    item.product = product;
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive POST request to delete an item from a cart
router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter(item => item.id !== itemId);

  await cartsRepo.update(req.session.cartId, { items });

  res.redirect("/cart");
});

module.exports = router;
