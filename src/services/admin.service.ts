import { PostRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import { In } from 'typeorm';


export default class AdminService {
    private postRepository: PostRepository;
    


    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async ListPostPending() {
        const postPending = await this.postRepository.find({
            where: { status: "Pending" },
            relations: ["owner", "owner.account"], // Tự động join bảng Customer theo quan hệ ManyToOne
            select: {
                owner: {
                    firstName: true,
                    lastName: true,
                    account: {
                        email: true,
                        phone: true
                    }
                }
            }
        });
        if(!postPending || postPending.length === 0){
            return Result.fail(404,"Not_Found_Post")
        }
        return Result.ok(postPending)
    }

    async changStatusService(status: string, postId: number, message: string){

        if (status === "Reject" && (!message || message.trim() === "")) {
            return Result.fail(400, "Rejection reason is required when status is 'Reject'");
        }

        const update = await this.postRepository.update({ postId }, { status });

        if(update.affected === 0){
            return Result.fail(404,"Post not found or status not changed")
        }
        return Result.ok("Post status updated successfully")

    }
}