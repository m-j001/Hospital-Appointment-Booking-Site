var express = require('express');
var router = express.Router();
var database = require('../server');
const bcrypt = require('bcrypt');


router.get('/', function(req, res, next) {
 res.render('index', { title: 'Express', session : req.session });
});
router.get('/indexdoc', function(req, res, next) {
 res.render('indexdoc', { title: 'Express', session : req.session });
});

router.get('/register', (req, res) => {
  res.render('register'); 
});
router.get('/registerdoc', (req, res) => {
  res.render('registerdoc'); 
});

router.get('/bookappointments', (req, res) => {
  res.render('bookappointments'); 
});

router.get('/dashboard', (req, res, next) => {
    if (!req.session.user_id) {
        return res.render('index'); 
    }

    const query = `SELECT * FROM patients WHERE email = ?`;

    database.query(query, [req.session.user_id], function(error, results) {
        if (error) {
            return next(error); 
        }

        if (results.length > 0) {
            const patient = results[0]; 
            res.render('dashboard', {
                session: req.session,
                patient: patient
            });
        } 
    });
});
router.get('/dashboarddoc', (req, res, next) => {
    if (!req.session.user_id) {
        return res.render('indexdoc'); 
    }

    const query = `SELECT * FROM doctors WHERE email = ?`;

    database.query(query, [req.session.user_id], function(error, results) {
        if (error) {
            return next(error); 
        }

        if (results.length > 0) {
            const doctor = results[0]; 
            res.render('dashboarddoc', {
                session: req.session,
                doctor: doctor
            });
        } 
    });
});


router.get('/myappointments', (req, res, next) => {
    if (!req.session.user_id) {
        return res.render('index'); 
    }

    const queryapp = `SELECT * FROM appointments WHERE email = ?`;

    database.query(queryapp, [req.session.user_id], function(error, results) {
        if (error) {
            return next(error); 
        }

        if (results.length > 0) {
        const appointment = results;
        const latestAppointments = appointment
  .sort((a, b) => new Date(b.time) - new Date(a.time))
  .slice(0, 4)
  .map(app => ({
                ...app,
                formattedTime: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }).format(new Date(app.time))
            }));
        

            res.render('myappointments', {
                session: req.session,
                appointment: latestAppointments
            });
        } 
    });
});
router.get('/setappointmentsdoc', (req, res, next) => {
    if (!req.session.user_id) {
        return res.render('indexdoc');
    }

    const queryapp = `SELECT * FROM appointments WHERE doctor = ?`;

    database.query(queryapp, [req.session.user_fname], function(error, results) {
        if (error) {
            return next(error);
        }

        if (results.length > 0) {
        const appointment = results;
        const latestAppointments = appointment
  .sort((a, b) => new Date(b.time) - new Date(a.time))
  .slice(0, 4)
  .map(app => ({
                ...app,
                formattedTime: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }).format(new Date(app.time))
            }));
        

            res.render('setappointmentsdoc', {
                session: req.session,
                appointment: latestAppointments
            });
        } 
    });
});
router.get('/myappointmentsdoc', (req, res, next) => {
    if (!req.session.user_id) {
        return res.render('indexdoc');
    }

    const queryapp = `SELECT * FROM appointments WHERE doctor = ?`;

    database.query(queryapp, [req.session.user_fname], function(error, results) {
        if (error) {
            return next(error);
        }

        if (results.length > 0) {
        const appointment = results;
        const latestAppointments = appointment
  .sort((a, b) => new Date(b.time) - new Date(a.time))
  .slice(0, 4) // Take top 4
  .map(app => ({
                ...app,
                formattedTime: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }).format(new Date(app.time))
            }));
        

            res.render('myappointmentsdoc', {
                session: req.session,
                appointment: latestAppointments
            });
        } 
    });
});
router.post('/settimedoc', function(req, res, next) {

    if (!req.session.user_id) {
        return res.render('indexdoc');
    }
    var appt_id = req.body.id;
    var appt_time = req.body.time;
    var appt_status = 'pending';

    const queryapp = `SELECT * FROM appointments WHERE id = ? AND status != ?`;

    database.query(queryapp, [appt_id, appt_status], function(error, results) {
        if (error) {
            return next(error);
        }

        if (results.length > 0) {

            res.send('The Meeting Time Has Already Been Set By You, Kindly Check On The Status.'); 
             } else {

const queryset = "UPDATE appointments SET status = ? WHERE id = ? AND status = ?";
database.query(queryset, [appt_time, appt_id, appt_status], function(error, results) {
        if (error) {
            return next(error);
        }
  if (results.affectedRows > 0) {
res.redirect('/myappointmentsdoc');


  }
      });
        

            
        } 
    });
});





router.post('/signin', function(request, response, next) {
    var user_email_address = request.body.email;
    var user_password = request.body.password;

    if (user_email_address && user_password) {
        async function verifyPassword() {
            try {
               
                const query = `
                    SELECT * FROM patients 
                    WHERE email = "${user_email_address}"
                `;

                database.query(query, async function(error, data) {
                    if (error) {
                        console.error('Database query error:', error);
                        response.status(500).send('Internal Server Error');
                        return;
                    }

                  
                    if (data.length > 0) {
                      
                        const user = data[0];

                      
                        const isMatch = await bcrypt.compare(user_password, user.password);

                        if (isMatch) {
                        
                       
                           request.session.user_id = user.email;
                           response.redirect('/dashboard');
                        } else {
                         
                            response.send('Incorrect Password');
                           
                        }
                    } else {
                 
                        response.send('Incorrect Email Address');
                    }
                });
            } catch (err) {
                console.error('Error during password verification:', err);
                response.status(500).send('Internal Server Error');
            }
        }
        verifyPassword();
    } else {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }
});
router.post('/signindoc', function(request, response, next) {
    var user_email_address = request.body.email;
    var user_password = request.body.password;

    if (user_email_address && user_password) {
        async function verifyPassword() {
            try {
               
                const query = `
                    SELECT * FROM doctors 
                    WHERE email = "${user_email_address}"
                `;

                database.query(query, async function(error, data) {
                    if (error) {
                        console.error('Database query error:', error);
                        response.status(500).send('Internal Server Error');
                        return;
                    }

                
                    if (data.length > 0) {
                  
                        const user = data[0];

                     
                        const isMatch = await bcrypt.compare(user_password, user.password);

                        if (isMatch) {
                     
          
                           request.session.user_id = user.email;
                           request.session.user_fname = user.firstname;
                           response.redirect('/dashboarddoc');
                        } else {
                         
                            response.send('Incorrect Password');
                         
                        }
                    } else {
              
                        response.send('Incorrect Email Address');
                    }
                });
            } catch (err) {
                console.error('Error during password verification:', err);
                response.status(500).send('Internal Server Error');
            }
        }
        verifyPassword();
    } else {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }
});


router.post('/register', function(request, response, next) {
    var user_f_name = request.body.fname;
    var user_l_name = request.body.lname;
    var user_email_address = request.body.email;
    var user_password = request.body.password;
    var user_address = request.body.address;
    var user_phone = request.body.phone;

    if (user_f_name && user_l_name && user_email_address && user_password && user_address && user_phone) {
        const query = `
            SELECT * FROM patients 
            WHERE email = ? OR phone_number = ?`;

        database.query(query, [user_email_address, user_phone], async function(error, data) {
            if (error) {
                return next(error);
            }

            if (data.length > 0) {
                response.send('Email or phone number already exists!');
            } else {
                try {
                
                    const password_hash = await bcrypt.hash(user_password, 10);
                    
                    const sql = `
                        INSERT INTO patients (firstname, lastname, email, password, address, phone_number) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

                 
                    database.query(sql, [user_f_name, user_l_name, user_email_address, password_hash, user_address, user_phone], function(error, results) {
                        if (error) {
                            return next(error);
                        }
                        response.send('User registered successfully!');
                    });
                } catch (err) {
                    console.error('Error hashing the password:', err);
                    response.status(500).send('Internal server error');
                }
            }
        });
    } else {
        response.send('You did not fill out all required fields.');
        response.end();
    }
});

router.post('/registerdoc', function(request, response, next) {
    var user_f_name = request.body.fname;
    var user_l_name = request.body.lname;
    var user_email_address = request.body.email;
    var user_password = request.body.password;
    var user_address = request.body.address;
    var user_phone = request.body.phone;

    if (user_f_name && user_l_name && user_email_address && user_password && user_address && user_phone) {
        const query = `
            SELECT * FROM doctors 
            WHERE email = ? OR firstname = ?`;

        database.query(query, [user_email_address, user_f_name], async function(error, data) {
            if (error) {
                return next(error); 
            }

            if (data.length > 0) {
                response.send('Email or firstname already exists!');
            } else {
                try {
                    
                    const password_hash = await bcrypt.hash(user_password, 10);
                    
                    const sql = `
                        INSERT INTO doctors (firstname, lastname, email, password, address, phone_number) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

                   
                    database.query(sql, [user_f_name, user_l_name, user_email_address, password_hash, user_address, user_phone], function(error, results) {
                        if (error) {
                            return next(error); 
                        }
                        response.send('User registered successfully!');
                    });
                } catch (err) {
                    console.error('Error hashing the password:', err);
                    response.status(500).send('Internal server error');
                }
            }
        });
    } else {
        response.send('You did not fill out all required fields.');
        response.end();
    }
});


router.post('/bookappointments', function(req, res, next) {

 if (!req.session.user_id) {
        return res.render('index');
    }

    const query = `SELECT * FROM patients WHERE email = ?`;

    database.query(query, [req.session.user_id], function(error, results) {
        if (error) {
            return next(error); 
        }

        if (results.length > 0) {
            const patient = results[0];
            
            var specialty = req.body.specialty;
            var insurance = req.body.insurance;
            var hosnum = req.body.hosnum;
            var doctor = req.body.doctor;
            var user_email_address = patient.email;
            var user_phone = patient.phone_number;
            var status = 'pending';
            
             if (specialty && insurance && hosnum && doctor && user_email_address && user_phone) {
             
             const checkquery = `SELECT * FROM appointments 
                    WHERE email = ? AND doctor = ? AND status = ?`;

    database.query(checkquery, [user_email_address, doctor, status], function(error, results) {
        if (error) {
            return next(error); 
        }

        if (results.length > 0) {
             res.send('Appointment with doctor already booked! Kindly wait for approval and meeting time.');

        }
    else {

         const sql = `
                        INSERT INTO appointments(specialty, insurance, hosnum, doctor, email, phone_number, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

                        database.query(sql, [specialty, insurance, hosnum, doctor, user_email_address, user_phone, status], function(error, results) {
                         if (error) {
                            return next(error);
                        }
                        res.send('Appointment Booked successfully!');                 

                        });
    }});                     
        }
            else {
        res.send('You did not fill out all required fields.');
        res.end();
    }
        } 
}); 
});

router.post('/logout', function(req, res, next) {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        res.redirect('/');
    });
});
router.post('/logoutdoc', function(req, res, next) {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        res.redirect('indexdoc');
    });
});

module.exports = router;