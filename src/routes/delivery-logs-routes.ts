import { Router } from "express";
import { DeliveryLogsController } from '../controllers/delivery-logs-controller'
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const deliveryLogsRoutes = Router()
const deliveryLogsController = new DeliveryLogsController()


// mids: 
// 1º verifica se o usuário está autenticado, 
// 2º verifica se ele tem permissão para acessar essa rota. O array diz qual role precisa para acessar essa rota, 
// as mesmas definidas para o campo "role" na tabela de uruários (presente no ENUM do arquivo schema.prisma)
// NOTA: as mids estão dentro de uma rota específica e não dentro da rota geral (deliveryLogsRoutes.use(mids))
// porque quem é vendas (role="sales") pode criar. Mas quem é cliente poderá consultar. 
// Usar de modo geral restringiria a rota para quem é cliente.
deliveryLogsRoutes.post('/', ensureAuthenticaded, verifyUserAuthorization(['sales']), deliveryLogsController.create)
deliveryLogsRoutes.get('/:delivery_id', ensureAuthenticaded, verifyUserAuthorization(['sales', 'customer']), deliveryLogsController.show)

export { deliveryLogsRoutes }
