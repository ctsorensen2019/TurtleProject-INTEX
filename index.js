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
        password: process.env.RDS_PASSWORD || "Christian0427",
        database: process.env.RDS_DB_NAME || "turtle shelter",
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


//
//
//CLIENT
//SIDE
//
//

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


//
//Volunteer Signup
//

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


  //
  //Event Request
  //

  app.get('/eventReq', (req, res) => {
    res.render('eventReq'); // Render the login.ejs file and pass in security
  });

//
//
//SERVER
//SIDE
//
//

//
//Users
//

//
//Events
//

//
//Volunteers
//


// Start the server
app.listen(port, () => console.log("Turtle Shelter Express App has started and server is listening on port 3110!"));
