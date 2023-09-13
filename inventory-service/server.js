const express = require("express");
const cors = require("cors");
const dbConfig = require("./db");

const PORT = process.env.PORT || 8081;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/inventory", async (req, res) => {
  req.body.id = Date.now();
  const params = {
    TableName: dbConfig.Table,
    Item: req.body,
  };
  try {
    await dbConfig.db.put(params).promise();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false });
  }
});

app.get("/inventory", async (req, res) => {
  const params = {
    TableName: dbConfig.Table,
  };

  try {
    const { Items = [] } = await dbConfig.db.scan(params).promise();
    res.status(200).json({ success: true, data: Items });
  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false });
  }
});

app.delete("/inventory/:id", async (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    return res.status(400).json({ success: false, error: "Missing item ID." });
  }

  const params = {
    TableName: dbConfig.Table,
    Key: {
      id: parseInt(itemId),
    },
  };

  try {
    // Check if the item exists before attempting to delete
    const existingItem = await dbConfig.db.get(params).promise();
    if (!existingItem.Item) {
      return res.status(404).json({ success: false, error: "Item not found." });
    }

    // Delete the item
    await dbConfig.db.delete(params).promise();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

app.put("/inventory/:id/:newCount", async (req, res) => {
  const itemId = req.params.id;
  const newCount = req.params.newCount;

  if (!itemId) {
    return res.status(400).json({ success: false, error: "Missing item ID." });
  }

  const updateParams = {
    TableName: dbConfig.Table,
    Key: {
      id: parseInt(itemId),
    },
    UpdateExpression: "SET #attrName = :attrValue",
    ExpressionAttributeNames: {
      "#attrName": "count", 
    },
    ExpressionAttributeValues: {
      ":attrValue": parseInt(newCount), 
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    // Check if the item exists before attempting to update
    const existingItem = await dbConfig.db
      .get({ TableName: dbConfig.Table, Key: { id: parseInt(itemId) } })
      .promise();
    if (!existingItem.Item) {
      return res.status(404).json({ success: false, error: "Item not found." });
    }

    // Update the item
    const updatedItem = await dbConfig.db.update(updateParams).promise();

    res
      .status(200)
      .json({ success: true, updatedItem: updatedItem.Attributes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// INTERNAL CALL
app.get("/inventory/validate/:id", async (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    return res.status(400).json({ success: false, error: "Missing item ID." });
  }

  const params = {
    TableName: dbConfig.Table,
    Key: {
      id: parseInt(itemId),
    },
  };

  try {
    const existingItem = await dbConfig.db.get(params).promise();

    if (existingItem.Item) {
      // Item with the provided ID exists in the database
      res.status(200).json({ success: true, exists: true });
    } else {
      // Item with the provided ID does not exist in the database
      res.status(200).json({ success: true, exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log("Server running on PORT : " + PORT);
});
