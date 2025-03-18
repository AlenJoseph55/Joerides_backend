import { router }  from '../utils/utils.js';
import authenticate from '../middlewares/auth.js';

import {
    GetBicycle,
    AddBicycle,
    UpdateBicycle, DeleteBicycle } from '../controllers/cycles.js'

router.route('/').get(GetBicycle);
router.route('/add').post(authenticate("ADMIN"), AddBicycle);
router.route('/:id').put(authenticate("ADMIN"), UpdateBicycle);
router.route('/:id').delete(authenticate("ADMIN"), DeleteBicycle);
export default router;