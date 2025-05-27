router.post('/bookappointments', function(req, res, next) {
    // Ensure user is logged in
    if (!req.session.user_id) {
        return res.render('index'); // Redirect if session is missing
    }

    const getPatientQuery = `SELECT * FROM patients WHERE email = ?`;

    database.query(getPatientQuery, [req.session.user_id], function(error, results) {
        if (error) {
            return next(error);
        }

        if (results.length > 0) {
            const patient = results[0];

            const {
                specialty,
                insurance,
                hosnum,
                doctor
            } = req.body;

            const user_email_address = patient.email;
            const user_phone = patient.phone_number;
            const status = 'pending';

            if (specialty && insurance && hosnum && doctor && user_email_address && user_phone) {
                const checkAppointmentQuery = `
                    SELECT * FROM appointments 
                    WHERE email = ? AND doctor = ? AND status = ?`;

                database.query(checkAppointmentQuery, [user_email_address, doctor, status], function(error, existingAppointments) {
                    if (error) {
                        return next(error);
                    }

                    if (existingAppointments.length > 0) {
                        return res.send('Appointment with doctor already booked! Kindly wait for approval and meeting time.');
                    }

                    const insertAppointmentQuery = `
                        INSERT INTO appointments 
                        (specialty, insurance, hosnum, doctor, email, phone_number, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

                    database.query(insertAppointmentQuery,
                        [specialty, insurance, hosnum, doctor, user_email_address, user_phone, status],
                        function(error, insertResults) {
                            if (error) {
                                return next(error);
                            }

                            res.send('Appointment Booked successfully!');
                        });
                });
            } else {
                res.send('You did not fill out all required fields.');
            }
        } else {
            res.send('User session invalid.');
        }
    });
});
