// import { Admin } from '@/domains/entities/admin.entity'
// import { Customer } from '@/domains/entities/customer.entity'
// import { EntityParticipantType } from '@/domains/entities/enum/value-object'
// import { ParticipantRepository } from '@/infras/repositories'
// import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'

// @EventSubscriber()
// export class CreateParticipantCustomerSubscriber implements EntitySubscriberInterface<Customer> {
//   listenTo() {
//     return Customer
//   }

//   afterInsert(event: InsertEvent<Customer>) {
//     const repo = new ParticipantRepository()
//     repo.save({
//       customerId: event.entity.customerId,
//       typeUser: EntityParticipantType.CUSTOMER
//     })
//   }
// }

// @EventSubscriber()
// export class CreateParticipantAdminSubscriber implements EntitySubscriberInterface<Admin> {
//   listenTo() {
//     return Admin
//   }

//   afterInsert(event: InsertEvent<Admin>) {
//     const repo = new ParticipantRepository()
//     repo.save({
//       adminId: event.entity.adminId,
//       typeUser: EntityParticipantType.CUSTOMER
//     })
//   }
// }
