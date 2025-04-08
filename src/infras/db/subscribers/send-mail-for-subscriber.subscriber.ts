import { Customer } from '@/domains/entities/customer.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'
import { Post } from '@/domains/entities/post.entity'
import { SubscriptionAreaPost } from '@/domains/entities/subscription-area-post.entity'
import { MailService } from '@/services'
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm'

@EventSubscriber()
export class CreateParticipantCustomerSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post
  }

  async afterUpdate(event: UpdateEvent<Post>) {
    try {
      if (event.entity) {
        if (
          event.entity.status !== event.databaseEntity.status &&
          event.entity.status === PostStatus.APPROVED &&
          event.databaseEntity.status === PostStatus.PENDING
        ) {
          const postRepository = event.manager.getRepository(Post)
          const post = await postRepository.findOne({
            where: {
              postId: event.databaseEntity.postId
            }
          })
          if (post) {
            const subscriptionRepository = event.manager.getRepository(SubscriptionAreaPost)
            const subscriptions = await subscriptionRepository.find({
              where: {
                city: post.city,
                district: post.district
              }
            })
            const mailService = new MailService()
            await mailService.createTransporter()
            for (const subscription of subscriptions) {
              const customerRepository = event.manager.getRepository(Customer)
              const customer = await customerRepository.findOne({
                select: {
                  customerId: true,
                  lastName: true,
                  firstName: true,
                  account: {
                    email: true
                  }
                },
                where: {
                  customerId: subscription.customerId
                },
                relations: {
                  account: true
                }
              })
              if (customer) {
                await mailService.sendMail({
                  from: 'TroTotVN',
                  to: customer.account.email,
                  subject: 'OTP Verification',
                  html: `<h1>Có bài viết mới trong khu vực mà bạn đã đăng ký.</h1> 
                </br> 
                <p>${post.title}</p> <p>${post.postId}</p>
                <a href="http://localhost:3000/posts/${post.postId}/detail">Xem bài viết</a>
                <p>Địa chỉ: ${post.district} ${post.city} </p>
                <p>Giá: ${post.price}</p>
                <p>Người đăng: ${customer.lastName} ${customer.firstName}</p>
                <p>Ngày đăng: ${post.createdAt}</p>`
                })
                console.log('send mail to', customer.account.email)
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('error', e)
    }
  }
}
