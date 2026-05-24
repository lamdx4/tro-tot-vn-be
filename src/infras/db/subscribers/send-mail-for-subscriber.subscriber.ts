import { Customer } from '@/domains/entities/customer.entity'
import { DeviceToken } from '@/domains/entities/device-token.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'
import { Post } from '@/domains/entities/post.entity'
import { SubscriptionAreaPost } from '@/domains/entities/subscription-area-post.entity'
import { MailService, FCMService } from '@/services'
import { ConfigService } from '@/services/config.service'
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent, In } from 'typeorm'

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
            
            const configService = ConfigService.gI()
            const frontendUrl = configService.getOrThrow('FRONTEND_URL')
            
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
                mailService.sendMail({
                  from: 'TroTotVN',
                  to: customer.account.email,
                  subject: 'Tin trọ mới từ TroTotVN',
                  html: `<h1>Có bài viết mới trong khu vực mà bạn đã đăng ký.</h1> 
                </br> 
                <p>${post.title}</p> <p>${post.postId}</p>
                <a href="${frontendUrl}/posts/${post.postId}/detail">Xem bài viết</a>
                <p>Địa chỉ: ${post.district} ${post.city} </p>
                <p>Giá: ${post.price}</p>
                <p>Người đăng: ${customer.lastName} ${customer.firstName}</p>
                <p>Ngày đăng: ${post.createdAt}</p>`
                })
                console.log('send mail to', customer.account.email)

                // Truy vấn danh sách token thiết bị đã đăng ký của khách hàng (FCM)
                const deviceTokenRepository = event.manager.getRepository(DeviceToken)
                const deviceTokens = await deviceTokenRepository.find({
                  where: {
                    customerId: subscription.customerId
                  }
                })

                if (deviceTokens.length > 0) {
                  const tokens = deviceTokens.map(dt => dt.fcmToken)
                  const fcmService = FCMService.gI()
                  
                  const response = await fcmService.sendMulticast(tokens, {
                    notification: {
                      title: 'Tin trọ mới từ TroTotVN',
                      body: `Có bài viết mới trong khu vực mà bạn đã đăng ký: ${post.title}`
                    },
                    data: {
                      postId: post.postId.toString(),
                      type: 'new_post_subscription'
                    }
                  })

                  if (response) {
                    console.log(`[FCM] Sent successfully: ${response.successCount}, failed: ${response.failureCount}`)
                    
                    // Tự động quét sạch các token không hợp lệ hoặc hết hạn mà Firebase báo về
                    const invalidTokens = fcmService.getInvalidTokens(tokens, response)
                    if (invalidTokens.length > 0) {
                      console.log(`[FCM] Purging ${invalidTokens.length} expired tokens for customer ID: ${subscription.customerId}`)
                      await deviceTokenRepository.delete({
                        fcmToken: In(invalidTokens)
                      })
                    }
                  }
                }
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
