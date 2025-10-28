import { Customer } from '@/domains/entities/customer.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'
import { PostModerationHistory } from '@/domains/entities/post-moderator-history.entity'
import { Post } from '@/domains/entities/post.entity'
import { SubscriptionAreaPost } from '@/domains/entities/subscription-area-post.entity'
import { MailService } from '@/services'
import { ConfigService } from '@/services/config.service'
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm'

@EventSubscriber()
export class AdminModeratePost implements EntitySubscriberInterface<PostModerationHistory> {
  listenTo() {
    return PostModerationHistory
  }

  async afterInsert(event: InsertEvent<PostModerationHistory>) {
    try {
      const postModeratorRepository = event.manager.getRepository(PostModerationHistory)
      if (!event.entityId) {
        return
      }
      const history = await postModeratorRepository.findOne({
        where: {
          historyId: Number(event.entityId)
        },
        relations: {
          post: {
            owner: {
              account: true
            }
          }
        }
      })
      if (!history) {
        return
      }
      const configService = ConfigService.gI()
      const frontendUrl = configService.getOrThrow('FRONTEND_URL')
      
      const mailService = new MailService()
      await mailService.createTransporter()
      if (history.post.status === PostStatus.APPROVED) {
        mailService.sendMail({
          sender: 'TroTotVN',
          from: 'TroTotVN',
          to: history.post.owner.account.email,
          subject: 'Tin của bạn đã được duyệt',
          html: `
            <h1>Chúc mừng bạn!</h1>
            <p>Tin của bạn đã được duyệt thành công.</p>
            <p>Thông tin chi tiết:</p>
            <p>Tiêu đề: ${history.post.title}</p>
            <p>Giá: ${history.post.price}</p>
            <p>Địa chỉ: ${history.post.streetNumber}, ${history.post.street}, ${history.post.ward}, ${history.post.district}, ${history.post.city}</p>
            <p>Diện tích: ${history.post.acreage} m2</p>
            <p>Thời gian tạo: ${history.post.createdAt}</p>
            <p>Thời gian duyệt: ${history.execAt}</p>
            <p> Xem chi tiết tại: <a href="${frontendUrl}/posts/${history.postId}/detail"> Đây</a> </p>
            `
        })
        return
      } else if (history.post.status === PostStatus.REJECTED) {
        mailService.sendMail({
          sender: 'TroTotVN',
          from: 'TroTotVN.vn',
          to: history.post.owner.account.email,
          subject: 'Tin của bạn đã bị từ chối',
          html: `
            <h1>Rát tiếc</h1>
            <p>Tin ${history.post.title} của bạn đã bị từ chối.</p>
            <p>Lý do: ${history.reason}</p>
            <p>Thông tin chi tiết:</p>
            <p>Giá: ${history.post.price}</p>
            <p>Địa chỉ: ${history.post.streetNumber}, ${history.post.street}, ${history.post.ward}, ${history.post.district}, ${history.post.city}</p>
            <p>Diện tích: ${history.post.acreage} m2</p>
            <p>Thời gian tạo: ${history.post.createdAt}</p>
            <p>Thời gian duyệt: ${history.execAt}</p>            `
        })
      }
    } catch (e) {
      console.log('error', e)
    }
  }
}
