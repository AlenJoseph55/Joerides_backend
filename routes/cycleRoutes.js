const { router } = require('../utils/utils');
const authenticate = require('../middlewares/auth')

const {
    GetBicycle,
    AddBicycle,
    UpdateBicycle, DeleteBicycle } = require('../controllers/cycles')

router.route('/').get(GetBicycle);
router.route('/add').post(authenticate("ADMIN"), AddBicycle);
router.route('/:id').put(authenticate("ADMIN"), UpdateBicycle);
router.route('/:id').delete(authenticate("ADMIN"), DeleteBicycle);

module.exports = router;