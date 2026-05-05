import { Customer } from '@/domains/entities/customer.entity'
import { BaseRepository } from './base.repository'
import { Account } from '@/domains/entities/account.entity'
import ChangedProfileDto from '@/web/controllers/dto/changed-profile.dto'
import moment from 'moment'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super(Customer)
  }
  async updateProfile(
    customerId: number,
    data: ChangedProfileDto,
    callbackGetNewAvatarFile: () => Promise<string | null>,
    callbackRemoveOldAvatarFile: (fileCloudId: string) => Promise<void>
  ): Promise<boolean> {
    try {
      return await this.manager.transaction(async (transactionalEntityManager) => {
        const fileCloudId = await callbackGetNewAvatarFile()
        const customer = await transactionalEntityManager.findOne(Customer, {
          where: { customerId },
          relations: { account: true, avatarFile: true }
        })
        if (!customer) {
          return false
        }

        let avatarFile: MultimediaFile | undefined = undefined
        if (fileCloudId) {
          avatarFile = await transactionalEntityManager.save(
            transactionalEntityManager.create(MultimediaFile, {
              fileCloudId: fileCloudId,
              fileType: 'Image'
            })
          )
        }

        await transactionalEntityManager.update(
          Customer,
          { customerId: customerId },
          {
            bio: data.bio,
            lastName: data.lastName,
            firstName: data.firstName,
            birthday: !isNaN(moment(data.birthDate, 'DD/MM/YYYY').toDate().getTime())
              ? moment(data.birthDate, 'DD/MM/YYYY').toDate()
              : undefined,
            gender: data.gender,
            currentCity: data.currentCity !== '' && data.currentCity ? data.currentCity : undefined,
            currentDistrict: data.currentDistrict !== '' && data.currentDistrict ? data.currentDistrict : undefined,
            currentJob: data.currentJob !== '' && data.currentJob ? data.currentJob : undefined,
            avatar: fileCloudId ? avatarFile?.fileId : undefined
          }
        )

        await transactionalEntityManager.update(Account, customer.accountId, {
          email: data.email
        })

        if (data.avatarFile && customer.avatarFile) {
          const oldAvatarFileId = customer.avatarFile.fileId
          const oldCloudId = customer.avatarFile.fileCloudId
          
          // Clear the reference first to avoid foreign key issues
          await transactionalEntityManager.update(Customer, { customerId }, { avatar: undefined as any })
          
          // Delete the old MultimediaFile record
          await transactionalEntityManager.delete(MultimediaFile, { fileId: oldAvatarFileId })
          
          // Delete from Drive
          if (oldCloudId) await callbackRemoveOldAvatarFile(oldCloudId)
        }
        return true
      })
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
