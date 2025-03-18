import {router} from '../utils/utils.js';


import {login, register} from '../controllers/auth.js';

router.route('/login').post(login);
router.route('/register').post(register);

export default router;