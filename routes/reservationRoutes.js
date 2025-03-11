const {router} = require('../utils/utils')
const authenticate = require('../middlewares/auth')

const {GetReservations, CreateReservation, ExtendReservation, CancelReservation, GetActiveReservations, ManualCompleteReservation} = require('../controllers/reservation');

router.route('/').post( CreateReservation);
router.route('/:id/cancel').put(CancelReservation);
router.route('/test').get(authenticate(), GetReservations);
router.route('/:id/update').put(ExtendReservation);
router.route('/active/:id').get(authenticate(),GetActiveReservations );
router.route('/complete/:id').put(authenticate(),ManualCompleteReservation);
module.exports = router;