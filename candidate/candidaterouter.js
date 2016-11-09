let router = require('express').Router();
let async = require('async');

let candidateprocessor = require('./candidateprocessor');
let candidate = require('./candidateschema');
let profileprocessor = require('../profiles/profileprocessor');
let educationprocessor = require('../sectioneducation/educationprocessor');
let personalInfoprocessor = require(
    '../sectionpersonalinfo/personalinfoprocessor');
let projectprocessor = require('../sectionproject/projectprocessor');
let skillprocessor = require('../sectionskill/skillprocessor');
let workexpprocessor = require('../sectionworkexperiance/workprocessor');
let candidateneo = require('./candidateneoprocessor');
let verificationprocessor = require('../verification/verificationprocesser');


router.post('/parse', function(req, res) {

    try {
        let data = [];
        async.parallel({

            profession: function(callback) {
                candidateneo.parseprofession(req.body,
                    function(profession) {
                        callback(null, profession);
                    },
                    function(err) {
                        callback(err, null);
                    });
            },
            location: function(callback) {
                candidateneo.parselocation(req.body,
                    function(location) {
                        callback(null, location);
                    },
                    function(err) {
                        callback(err, null);
                    });
            },
            skill: function(callback) {
                candidateneo.parseskill(req.body,
                    function(skill) {
                        callback(null, skill);
                    },
                    function(err) {
                        callback(err, null);
                    });
            }

        }, function success(err, query) {
            if (err) {
                res.status(500).json({ msg: err });
            } else {

                candidateneo.searchquery(query, function(results) {
                    res.status(200).json(results);
                }, function(err) {
                    res.status(500).json({ message: 'No matches found' });
                });
            }
        });


    } catch (err) {
        res.status(500).json(err);
    }
});


router.get('/profession', function(req, res) {
    try {

        candidateneo.getProfessions(function(professions) {

            res.status(200).json(professions);
        }, function(err) {
            res.status(500).json(err);
        });
    } catch (err) {

        res.status(500).json({
            error: 'Server error...try again later'
        });
    }
});


/* Get the Candidate Collection with the given Candidate id  */
// HTTP GET /candidate/:candidateid /
// effective url /candidate/:candidateid
router.get('/:candidateid', function(req, res) {

    try {
        candidateprocessor.getcandidate(req.params.candidateid,
            function(candidateObj) {
                res.status(200).json(candidateObj);
            },
            function(err) {
                res.status(500).json(err);
            }
        );
    } catch (err) {

        res.status(500).json({
            error: 'Internal error occurred, please report'
        });
    }
});

/* Register the Candidate by creating Candidate and other collections using form data and default values */
// HTTP POST /candidate/:candidateid /
// effective url /candidate/
router.post('/', function(req, res) {
    try {
        candidateneo.createCandidate(req.body, function(err, stat) {
            if (err) {
                console.log("err--------------------->",err);
            } else {
                console.log("stat-------------------->",stat);
            }
        });
        // create every section,candidate,profile if candidate is created for first time
        candidate.find({
            candidateid: req.body.mobile
        }, function(error, candidate) {

            /*if (candidate === '') {*/
                if(candidate.length == 0){

               // console.log('inside ifffffffffffffffffffffffffffff--->',candidate.length);
                async.parallel({
                        candidate: function(callback) {
                            candidateprocessor.createNewcandidate(req.body,
                                function(candidateobj) {
                                    callback(null, candidateobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        profile: function(callback) {
                            profileprocessor.createNewprofile(req.body,
                                function(profileobj) {

                                    callback(null, profileobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        education: function(callback) {
                            educationprocessor.createNewEducation(req.body,
                                function(educationobj) {
                                    callback(null, educationobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        personalinfo: function(callback) {
                            personalInfoprocessor.createNewpersonalinfo(req.body,
                                function(personalinfoobj) {
                                    callback(null, personalinfoobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        project: function(callback) {
                            projectprocessor.createNewProject(req.body,
                                function(projectobj) {
                                    callback(null, projectobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        skill: function(callback) {
                            skillprocessor.createNewSkill(req.body,
                                function(skillobj) {
                                    callback(null, skillobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        workexp: function(callback) {
                            workexpprocessor.createworkexp(req.body,
                                function(workexpobj) {
                                    callback(null, workexpobj);
                                },
                                function(err) {
                                    callback(err, null);
                                }
                            );
                        },
                        verificationdata: function(callback) {
                            verificationprocessor.createNewVerification(req.body,
                                function(verifyobj) {
                                    callback(null, verifyobj);
                                },
                                function(err) {
                                    callback(err, null);
                                });
                        }

                    },
                    function(err, results) {
                        if (err) {
                           console.log('ERR ----------------->: ', err);
                            return res.status(500).json({
                                msg: err
                            });
                        }

                        return res.status(201).json(results.personalinfo);
                    }
                ); // end of Async
            } // end if
            else {
                return res.status(500).send(
                    'Candidate already exists, try editing instead...!');
            }
        }); // end find
    } catch (err) {
        console.log("Internal Error Occurred inside catch");
        return res.status(500).send(
            'Internal error occurred, please report or try later...!');
    }
});

/* Update the candidate collection of the given candidate id NOTE:(Candidate id cant get update)*/
// HTTP PATCH /candidate/:candidateid /
// effective url /candidate/:candidateid

router.patch('/:candidateid', function(req, res) {
    candidate.find({
            candidateid: req.params.candidateid
        }, function(error, candidate) {
            if (candidate = '') {
                res.status(500).send(
                    'Candidate doesnt exists, Add Candidate before updating...!');
            } else {

                if (!req.body.candidateid) {
                    try {
                        candidateprocessor.updatecandidate(req.body, req.params.candidateid,
                            function(candidateObj) {
                                res.status(201).json(candidateObj);
                            },
                            function(err) {
                                res.status(500).json(err);
                            }
                        );
                    } catch (err) {
                       
                        res.status(500).json({
                            error: 'Internal error occurred, please report'
                        });
                    } // end catch
                } // end if
                else {
                    res.status(500).send('Alert! Can\'t update Candidate id... ');
                }
            } // end else
        }); // end find
});

module.exports = router;
