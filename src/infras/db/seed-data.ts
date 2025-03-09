import { Role } from '@/domains/entities/role.entity'
import { AccountRepository, CustomerRepository, RoleRepository } from '../repositories'

export default async function seedData() {
  let accountRepository = new AccountRepository()
  let roleRepository = new RoleRepository()
  let customerRepository = new CustomerRepository()

  const length = await roleRepository.count()
  if (length > 0) {
    console.log('Seed data already exists')
    return
  } else {
    await roleRepository.insert({
      roleName: 'Customer'
    })
    await roleRepository.insert({
      roleName: 'Moderator'
    })
    await roleRepository.insert({
      roleName: 'Manager'
    })
    let result = await accountRepository.insert({
      phone: '081234567890',
      password: 'password',
      roleId: 1,
      status: 'Active',
      email: 'test@123.com'
    })
    await customerRepository.insert({
      accountId: result.identifiers[0].accountId,
      firstName: 'Tui ten',
      lastName : 'lam',
      isVerified: 1,
      birthday: new Date('2004-01-20'),    
    })

    result = await accountRepository.insert({
      phone: '0888884456',
      password: 'password',
      roleId: 1,
      status: 'Active',
      email: 'test1@123.com'
    })
    await customerRepository.insert({
      accountId: result.identifiers[0].accountId,
      firstName: 'Tui ten',
      lastName : 'lam thu 2',
      isVerified: 1,
      birthday: new Date('2004-01-20'),  
    })
  }
}
