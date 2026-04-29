import { Router } from 'express';
import { login, register } from '../controllers/auth';
import { validateLogin, validateRegister } from '../validations/authSchema';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router;
