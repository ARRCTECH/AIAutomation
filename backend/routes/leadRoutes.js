// routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');



router.post('/', leadController.createLead);


router.get('/', leadController.getAllLeads);


router.get('/:id', leadController.getLeadById);

router.put('/:id', leadController.updateLead);


router.delete('/:id', leadController.deleteLead);

router.post('/bulk-upload', leadController.bulkUpload);



module.exports = router;