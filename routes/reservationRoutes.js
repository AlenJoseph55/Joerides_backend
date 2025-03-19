import {router} from '../utils/utils.js'
import authenticate from '../middlewares/auth.js'

import {GetReservations, CreateReservation, ExtendReservation, CancelReservation, GetActiveReservations, ManualCompleteReservation} from '../controllers/reservation.js';

router.route('/').post( CreateReservation);
router.route('/:id/PUT').put(CancelReservation);
router.route('/GET').get(authenticate(), GetReservations);
router.route('/:id/extend').put(ExtendReservation);
router.route('/active/:id').get(authenticate(),GetActiveReservations );
router.route('/complete/:id').put(authenticate(),ManualCompleteReservation);
export default router;