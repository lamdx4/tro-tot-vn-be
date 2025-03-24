import { RoleFactory } from './factories/role.factory'
import { UserFactory } from './factories/user.factory'

export default async function seedData() {
  await RoleFactory.seedRolesAndPermissions()
  await UserFactory.seedUsers()
}
