// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')

// Initialize Express.js
const app = express();
app.use(cors())
// app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const port = 8000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/users');
const db = mongoose.connection;

// Define a schema for the user collection
const userSchema = new mongoose.Schema({
  username: String,
  // Add other fields as needed
});

// Define a model based on the schema
const User = mongoose.model('User', userSchema);




// Express.js route to handle creating a new user and their collection
app.post('/createUser', async (req, res) => {

const username = req.body.username ;

  console.log(req.body.username);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ username });
    await newUser.save();

    // Create a new collection for the user
    await db.createCollection(username);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/addData/:username', async (req, res) => {
    const { username } = req.params;
    // console.log(username);
    const { data , row ,col } = req.body;

    // console.log(data);
  
    try {
      // Check if the user exists
      const existingUser = await User.findOne({ username });
  
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get the collection for the user
      const userCollection = db.collection(username);
  
      // Insert data into the user's collection
      await userCollection.insertMany({ data });
  
      res.status(201).json({ message: 'Data added successfully' });
    } catch (error) {
      console.error('Error adding data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// getting user data

app.get('/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
      // Check if the user exists
      const existingUser = await User.findOne({ username });
  
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get the collection for the user
      const userCollection = db.collection(username);
  
      // Find data in the user's collection
      const userData = await userCollection.find().toArray();
  
      res.status(200).json({ message: 'User data found', userData });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});






// Start the Express.js server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
