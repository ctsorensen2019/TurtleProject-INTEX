//instantiates the variables necessary to connect to the localhost
let express = require('express');
let app = express();
let path = require('path');

//establishes security
let security = false;

//
const port = process.env.PORT || 3110;

// Configure knex to connect to the assignment3 database
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "Christian0427" || "6291509",
        database: process.env.RDS_DB_NAME || "turtle shelter" || "turtleshelter",
        port: process.env.RDS_PORT || 5432,
        //Uncomment the below code when we connect to RDS
        //ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
});

//Allows the client side to be in ejs in a folder called "views"
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to allow for css, javascript, images, and fonts
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// Route to display records
app.get('/', (req, res) => {
    res.render('index');//Delete when we have database working
//    knex('pokemon')
//      .join('poke_type', 'pokemon.poke_type_id', '=', 'poke_type.id')
//      .select(
//        'pokemon.id',
//        'pokemon.description',
//        'pokemon.base_total',
//        'pokemon.date_created',
//        'pokemon.active_poke',
//        'pokemon.gender',
//        'pokemon.poke_type_id',
//        'poke_type.description as poke_type_description'
  //    )
//      .then(pokemon => {
//        // Render the index.ejs template and pass the data
//        res.render('index', { pokemon });
//      })
 //     .catch(error => {
 //       console.error('Error querying database:', error);
 //       res.status(500).send('Internal Server Error');
 //     });
  });



////////
////////
//CLIENT
//SIDE
////////
////////



app.get('/login', (req, res) => {
    res.render('login', {security}); // Render the login.ejs file and pass in security
});


//login for security purposes
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // Query the user table to find the record
        const user = knex('user')
            .select('*')
            .where({ username, password }) // Replace with hashed password comparison in production
            .first(); // Returns the first matching record
        if (user) {
            security = true;
        } else {
            security = false;
        }
        //required every time knex is used
    } catch (error) {
        res.status(500).send('Database query failed: ' + error.message);
    }
    res.redirect("/adminLand")
});


/////
//Volunteer Signup
/////

// this is the post to insert the volunteer information from the form into the database
app.post('/volunteerSignup', (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const zipcode = parseInt(req.body.zipcode);
    const how_found = req.body.how_found;
    const sewing_level = req.body.sewing_level;
    knex('volunteer')
      .insert({
        VolFirstName: first_name.toUpperCase(), // Ensure description is uppercase
        VolLastName: last_name.toUpperCase(),
        VolEmail : email.toUpperCase(),
        ZIP : zipcode,
        VolSewingLevel: sewing_level.toUpperCase(),
        HowDiscovered: how_found.toUpperCase()

      })
      .then(() => {
        res.redirect('/'); // Redirect to the root
      })
      .catch(error => {
        console.error('Error adding character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


/////
//Event Request
/////

  app.get('/eventReq', (req, res) => {
    res.render('eventReq'); // Render the login.ejs file and pass in security
  });



////////
////////
//SERVER
//SIDE
////////
////////



/////
//Users
/////


//Add//
//User//


//Gets the required info to be able to add Characters
app.get('/addUser', (req, res) => {
    // Fetch Character types to populate the dropdown
    knex('planets')
      .select('UserID', 'planet_name')
      .then(planets => {
        // Render the add form with the Character types data
        res.render('addStar', { planets });
      })
      .catch(error => {
        console.error('Error fetching Planets:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //Shows the changes on the client side
  app.post('/addStar', (req, res) => {
    // Extract form values from req.body
    const first_name = req.body.first_name || ''; // Default to empty string if not provided
    const last_name = req.body.last_name || ''; // Default to empty string if not provided
    const planet_name = parseInt(req.body.planet_name, 10); // Convert to integer
    const jedi = req.body.jedi === 'true'; // Checkbox returns true or undefined
    const weapon = req.body.weapon || 'N'; // Default to 'N' for None
    // Insert the new Characters into the database
    knex('characters')
      .insert({
        first_name: first_name.toUpperCase(), // Ensure description is uppercase
        last_name: last_name.toUpperCase(), // Ensure description is uppercase
        planet_name: planet_name,
        jedi: jedi,
        weapon: weapon
      })
      .then(() => {
        res.redirect('/'); // Redirect to the Character list page after adding
      })
      .catch(error => {
        console.error('Error adding Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


//Edit//
//User//


  //configures the edit star functionality
  app.get('/editStar/:id', (req, res) => {
    let id = req.params.id;
    // Query the Characters by ID first
    knex('characters')
      .where('id', id)
      .first()
      .then(characters => {
        if (!characters) {
          return res.status(404).send('Character not found');
        }
        // Query all Characters types after fetching the Characters
        knex('planets')
          .select('id', 'planet_name')
          .then(planets => {
            // Render the edit form and pass both characters and planets
            res.render('editStar', { characters, planets });
          })
          .catch(error => {
            console.error('Error fetching Planet names:', error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch(error => {
        console.error('Error fetching Characters for editing:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //further configures the edit star, and allows for edits
  app.post('/editStar/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    const first_name = req.body.first_name; //Pass the input to the request body and gives it a name
    const last_name = req.body.last_name; //Pass the input to the request body and gives it a name
    const planet_name = parseInt(req.body.planet_name); // Convert to integer
    // Since jedi is a checkbox, its value is only sent when the checkbox is checked.
    // If it is unchecked, no value is sent to the server.
    // This behavior requires special handling on the server-side to set a default
    // value for jedi when it is not present in req.body.
    const jedi = req.body.jedi === 'true'; // Convert checkbox value to boolean
    const weapon = req.body.weapon;

//Remove//
//User//


  //Allows for deletion
  app.post('/deleteStar/:id', (req, res) => {
    const id = req.params.id;
    knex('characters')
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Character list after deletion
      })
      .catch(error => {
        console.error('Error deleting Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });



/////
//Events
/////


//Add//
//Event//


//Gets the required info to be able to add Characters
app.get('/addStar', (req, res) => {
    // Fetch Character types to populate the dropdown
    knex('planets')
      .select('id', 'planet_name')
      .then(planets => {
        // Render the add form with the Character types data
        res.render('addStar', { planets });
      })
      .catch(error => {
        console.error('Error fetching Planets:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //Shows the changes on the client side
  app.post('/addStar', (req, res) => {
    // Extract form values from req.body
    const first_name = req.body.first_name || ''; // Default to empty string if not provided
    const last_name = req.body.last_name || ''; // Default to empty string if not provided
    const planet_name = parseInt(req.body.planet_name, 10); // Convert to integer
    const jedi = req.body.jedi === 'true'; // Checkbox returns true or undefined
    const weapon = req.body.weapon || 'N'; // Default to 'N' for None
    // Insert the new Characters into the database
    knex('characters')
      .insert({
        first_name: first_name.toUpperCase(), // Ensure description is uppercase
        last_name: last_name.toUpperCase(), // Ensure description is uppercase
        planet_name: planet_name,
        jedi: jedi,
        weapon: weapon
      })
      .then(() => {
        res.redirect('/'); // Redirect to the Character list page after adding
      })
      .catch(error => {
        console.error('Error adding Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


//Edit//
//Event//


//configures the edit star functionality
app.get('/editStar/:id', (req, res) => {
    let id = req.params.id;
    // Query the Characters by ID first
    knex('characters')
      .where('id', id)
      .first()
      .then(characters => {
        if (!characters) {
          return res.status(404).send('Character not found');
        }
        // Query all Characters types after fetching the Characters
        knex('planets')
          .select('id', 'planet_name')
          .then(planets => {
            // Render the edit form and pass both characters and planets
            res.render('editStar', { characters, planets });
          })
          .catch(error => {
            console.error('Error fetching Planet names:', error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch(error => {
        console.error('Error fetching Characters for editing:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //further configures the edit star, and allows for edits
  app.post('/editStar/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    const first_name = req.body.first_name; //Pass the input to the request body and gives it a name
    const last_name = req.body.last_name; //Pass the input to the request body and gives it a name
    const planet_name = parseInt(req.body.planet_name); // Convert to integer
    // Since jedi is a checkbox, its value is only sent when the checkbox is checked.
    // If it is unchecked, no value is sent to the server.
    // This behavior requires special handling on the server-side to set a default
    // value for jedi when it is not present in req.body.
    const jedi = req.body.jedi === 'true'; // Convert checkbox value to boolean
    const weapon = req.body.weapon;


//Remove//
//Event//

  //Allows for deletion
  app.post('/deleteStar/:id', (req, res) => {
    const id = req.params.id;
    knex('characters')
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Character list after deletion
      })
      .catch(error => {
        console.error('Error deleting Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


/////
//Volunteers
/////


//Add//
//Volunteer//


//Gets the required info to be able to add Characters
app.get('/addStar', (req, res) => {
    // Fetch Character types to populate the dropdown
    knex('planets')
      .select('id', 'planet_name')
      .then(planets => {
        // Render the add form with the Character types data
        res.render('addStar', { planets });
      })
      .catch(error => {
        console.error('Error fetching Planets:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //Shows the changes on the client side
  app.post('/addStar', (req, res) => {
    // Extract form values from req.body
    const first_name = req.body.first_name || ''; // Default to empty string if not provided
    const last_name = req.body.last_name || ''; // Default to empty string if not provided
    const planet_name = parseInt(req.body.planet_name, 10); // Convert to integer
    const jedi = req.body.jedi === 'true'; // Checkbox returns true or undefined
    const weapon = req.body.weapon || 'N'; // Default to 'N' for None
    // Insert the new Characters into the database
    knex('characters')
      .insert({
        first_name: first_name.toUpperCase(), // Ensure description is uppercase
        last_name: last_name.toUpperCase(), // Ensure description is uppercase
        planet_name: planet_name,
        jedi: jedi,
        weapon: weapon
      })
      .then(() => {
        res.redirect('/'); // Redirect to the Character list page after adding
      })
      .catch(error => {
        console.error('Error adding Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


//Edit//
//Volunteer//

//configures the edit star functionality
app.get('/editStar/:id', (req, res) => {
    let id = req.params.id;
    // Query the Characters by ID first
    knex('characters')
      .where('id', id)
      .first()
      .then(characters => {
        if (!characters) {
          return res.status(404).send('Character not found');
        }
        // Query all Characters types after fetching the Characters
        knex('planets')
          .select('id', 'planet_name')
          .then(planets => {
            // Render the edit form and pass both characters and planets
            res.render('editStar', { characters, planets });
          })
          .catch(error => {
            console.error('Error fetching Planet names:', error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch(error => {
        console.error('Error fetching Characters for editing:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //further configures the edit star, and allows for edits
  app.post('/editStar/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    const first_name = req.body.first_name; //Pass the input to the request body and gives it a name
    const last_name = req.body.last_name; //Pass the input to the request body and gives it a name
    const planet_name = parseInt(req.body.planet_name); // Convert to integer
    // Since jedi is a checkbox, its value is only sent when the checkbox is checked.
    // If it is unchecked, no value is sent to the server.
    // This behavior requires special handling on the server-side to set a default
    // value for jedi when it is not present in req.body.
    const jedi = req.body.jedi === 'true'; // Convert checkbox value to boolean
    const weapon = req.body.weapon;


//Remove//
//Volunteer//

  //Allows for deletion
  app.post('/deleteStar/:id', (req, res) => {
    const id = req.params.id;
    knex('characters')
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Character list after deletion
      })
      .catch(error => {
        console.error('Error deleting Character:', error);
        res.status(500).send('Internal Server Error');
      });
  });


// Start the server
app.listen(port, () => console.log("Turtle Shelter Express App has started and server is listening on port 3110!"));
