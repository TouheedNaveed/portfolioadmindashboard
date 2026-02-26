import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    listContacts,
    getStats,
    getContact,
    updateReadStatus,
    deleteContact,
    bulkUpdateRead,
} from '../controllers/contactController';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getStats);
router.get('/', listContacts);
router.get('/:id', getContact);
router.patch('/bulk-read', bulkUpdateRead);
router.patch('/:id/read', updateReadStatus);
router.delete('/:id', deleteContact);

export default router;
