const {router} = require('../utils/utils');


const {login, register} = require('../controllers/auth')

router.route('/login').post(login);
router.route('/register').post(register);

module.exports = router;