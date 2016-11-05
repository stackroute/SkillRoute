let rubric = require('./rubricmodel');
let router = require('express').Router();

let rubricprocessor = require('./rubricprocesser');

/* Effective url /rubric/name

 */
router.get('/:typename', function(req, res) {
   // console.log('Inside get');
   // console.log(req.params.typename);
    try {
        rubricprocessor.getrubric(req.params.typename,
            function(rubricdata) {
                res.status(200).json(rubricdata);
            },
            function(err) {
                res.status(500).json(err);
            }
        );
    } catch (err) {
       // console.log('Error occurred in getting rubric object: ', err);
        res.status(500).json({
            error: 'Internal error occurred, please report'
        });
    }
});

module.exports = router;
// end router
