const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("./db");
const Order = require("./order");

const PORT = process.env.PORT || 8082;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/order", async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Send an internal call to the user management service for validation
    const userValidationResponse = await axios.get(
      `http://localhost:8080/user/validate/${userId}`
    );

    // Send an internal call to the inventory management service for validation
    const inventoryValidationResponse = await axios.get(
      `http://localhost:8081/inventory/validate/${itemId}`
    );

    if (
      userValidationResponse.data.isValid &&
      inventoryValidationResponse.data.exists
    ) {
      const newOrder = new Order(req.body);
      await newOrder.save();
      return res.status(200).json({
        message: "Order Placed Successfully!",
        newOrder,
      });
    }

    res.status(403).json({
      message: "Order Placed Failed. User or inventory validation failed.",
    });
  } catch (error) {
    res.status(403).json({
      message: "Order Placed Failed",
      error,
    });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const allOrders = await Order.find();
    res.status(200).json({
      message: "All Orders Fetched Successfully",
      allOrders,
    });
  } catch (error) {
    res.status(403).json({
      message: "Orders Fetching Failed",
      error,
    });
  }
});

app.delete("/order/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Order Deleted Successfully",
      order,
    });
  } catch (error) {
    res.status(403).json({
      message: "Order Deletion Failed",
      error,
    });
  }
});

app.put("/order/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order Updated Successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Order Update Failed",
      error,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on PORT : " + PORT);
});
