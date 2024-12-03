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
        database: process.env.RDS_DB_NAME || "turtleshelter",
        port: process.env.RDS_PORT || 5432 || 5433
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
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
      // Query the user table to find the record
      const user = await knex('administration')
          .select('*')
          .where({ username, password }) // Replace with hashed password comparison in production
          .first(); // Returns the first matching record

      if (user) {
          // Successful login
          return res.redirect('/adminLand');
      } else {
          // Failed login
          return res.redirect('/');
      }
  } catch (error) {
      console.error('Database query failed:', error.message);
      // Handle database errors
      return res.redirect('/');
  }
});

app.get('/adminLand', (req, res) => {
    res.render('adminLand'); // Render the login.ejs file and pass in security
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
    const phone = req.body.phone;
    const how_found = req.body.how_found;
    const sewing_level = req.body.sewing_level;
    const esthour = req.body.esthour;
    knex('volunteers')
      .insert({
        volfirstname: first_name.toUpperCase() || "", // Ensure description is uppercase
        vollastname: last_name.toUpperCase() || "",
        volphonenumber: phone || "",
        volemail : email.toUpperCase() || "",
        zip : zipcode || "",
        volsewinglevel: sewing_level.toUpperCase() || "",
        howdiscovered: how_found.toUpperCase() || "",
        estmonthlyhours: esthour || ""

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
    res.render('eventReq'); // Render the eventReq file 
  });

  app.post('/submitEvent', async (req, res) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        streetAddress,
        city,
        state,
        zip,
        participants,
        sewingLevel,
        startTime,
        endTime,
        eventDates,
        wantStory,
    } = req.body;

    try {
        // Insert data into the database
        await knex('events').insert({
            estparticipants: participants,
            numparticipants: null, // Placeholder for actual participant count
            streetaddress: streetAddress,
            state: state,
            city: city,
            starttime: null,
            endtime: null,
            eststarttime: startTime, // Using estimated start time
            estendtime: endTime, // Using estimated end time
            eventsewinglevel: sewingLevel,
            contactfirstname: firstName,
            contactlastname: lastName,
            contactphonenumber: phoneNumber,
            sharestory: wantStory === 'y', // Convert 'y' to true and 'n' to false
            opentopublic: false, // Default to false unless specified elsewhere
            zip: zip,
            date: eventDates,
            approval: null, // Default to false; adjust based on business logic
        });

        // Redirect to a success page
        res.redirect('/');
    } catch (error) {
        console.error('Error inserting event data:', error.message);
        res.status(500).send('Internal Server Error: Unable to submit event.');
    }
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

app.get('/userMaint', (req, res) => {
    knex('administration')
      .select(
        'administration.username',
        'administration.password'
      )
      .then(administration => {
        // Render the index.ejs template and pass the data
        res.render('userMaint', { administration });
      })
      .catch(error => {
        console.error('Error querying Users database:', error);
        res.status(500).send('Internal Server Error');
      });
  });


//Add//
//User//


//Gets the required info to be able to add Characters
app.get('/addUser', (req, res) => {
        res.render('addUser', { security })}); // fetches the add user page


  //Shows the changes on the client side
  app.post('/addUser', (req, res) => {
    // Extract form values from req.body
    const username = req.body.username || ''; // Default to empty string if not provided
    const password = req.body.password || ''; // Default to empty string if not provided
    // Insert the new Characters into the database
    knex('administration')
      .insert({
        username: username, 
        password: password 
      })
      .then(() => {
        res.redirect('/'); // Redirect to the user list page after adding
      })
      .catch(error => {
        console.error('Error adding User:', error);
        res.status(500).send('Internal Server Error');
      });
  });


//Edit//
//User//


  //configures the edit user functionality
  app.get('/editUser/:username', (req, res) => {
    let username = req.params.username;
    // Query the User by ID first
    knex('administration')
      .where('username', username)
      .first()
      .then(administration => {
        if (!administration) {
          return res.status(404).send('User not found');
        }
      })
      .catch(error => {
        console.error('Error fetching Users for editing:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  //further configures the edit user, and allows for edits
  app.post('/editUser/:username', (req, res) => {
    // Access each value directly from req.body
   
    const password = req.body.password; //Pass the input to the request body and gives it a name
    knex('administration')
    .insert({
      username: username, 
      password: password 
    })
    .then(() => {
      res.redirect('/'); // Redirect to the user list page after adding
    })
    .catch(error => {
      console.error('Error adding User:', error);
      res.status(500).send('Internal Server Error');
    });
});

//Remove//
//User//


  //Allows for deletion
  app.post('/deleteUser/:username', (req, res) => {
    const username = req.params.username;
    knex('administration')
      .where('username', username)
      .del() // Deletes the record with the specified username
      .then(() => {
        res.redirect('/'); // Redirect to the user list after deletion
      })
      .catch(error => {
        console.error('Error deleting User:', error);
        res.status(500).send('Internal Server Error');
      });
  });



/////
//Events
/////


app.get('/eventMaint', async (req, res) => {
    try {
        // Query 1: Get events needing updates
        const needingUpdate = await knex('events').where('date', '<', knex.raw('CURRENT_DATE')).where({approval : true}).whereNull('numparticipants').select('*');

        // Query 2: Get events waiting for approval
        const waitingApproval = await knex('events').where('date', '>', knex.raw('CURRENT_DATE')).whereNull('approval').select('*');

        // Query 3: Get upcoming events
        const upcomingEvents = await knex('events')
        .where('date', '>', knex.raw('CURRENT_DATE')).where({approval : true}).whereNull('numparticipants').select('*')
            .orderBy('date', 'asc');

        // Query 4: Get completed events
        const completedEvents = await knex('events').whereNotNull('numparticipants');

        // Query 5: Get denied events
        const deniedEvents = await knex('events').where({ approval: false });

        // Render the page, passing the query results
        res.render('eventMaint', {
            needingUpdate,
            waitingApproval,
            upcomingEvents,
            completedEvents,
            deniedEvents,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


//Add//
//Event//



//Edit//
//Event//
// this is to update approval
app.post('/updateApproval', async (req, res) => {
  try {
      const eventId = req.body.approve || req.body.deny; // Get event ID from the button clicked
      const approvalStatus = req.body.approve ? true : false; // Set approval status based on which button was clicked

      // Update the event approval status in the database
      await knex('events')
          .where({ eventid: eventId })
          .update({ approval: approvalStatus });

      // Redirect back to the eventMaint page after updating
      res.redirect('/eventMaint');
  } catch (error) {
      console.error('Error updating approval:', error.message);
      res.status(500).send('Internal Server Error');
  }
});




//Remove//
//Event//


/////
//Volunteers
/////


//Add//
//Volunteer//




//Edit//
//Volunteer//



//Remove//
//Volunteer//


/////
//Team Members
/////

//Add//
//Team Members//




//Edit//
//Team Members//



//Remove//
//Team Members//


// Start the server
app.listen(port, () => console.log("Turtle Shelter Express App has started and server is listening on port 3110!"));
