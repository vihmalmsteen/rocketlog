import { Router } from "express";
import { DeliveriesController } from '../controllers/deliveries-controller'
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const deliveriesRoutes = Router()
const deliveriesController = new DeliveriesController()


// mids: 
// 1º verifica se o usuário está autenticado, 
// 2º verifica se ele tem permissão para acessar essa rota. O array diz qual role precisa para acessar essa rota, 
// as mesmas definidas para o campo "role" na tabela de uruários (presente no ENUM do arquivo schema.prisma)
deliveriesRoutes.use(ensureAuthenticaded, verifyUserAuthorization(['sales']))


deliveriesRoutes.post('/', deliveriesController.create)
deliveriesRoutes.get('/', deliveriesController.index)
deliveriesRoutes.patch('/:id/status', deliveriesController.updateStatus)


export { deliveriesRoutes }
