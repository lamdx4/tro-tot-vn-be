import { Post } from '@/domains/entities/post.entity'
import { Customer } from '@/domains/entities/customer.entity'
import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { PostStatus, InteriorCondition } from '@/domains/entities/enum/value-object'
import { fakerVI as faker } from '@faker-js/faker'
import AppDataSource from '@/infras/db/datasource'
import { CustomerRepository } from '@/infras/repositories/customer.repository'

export class PostFactory {
  // Vietnamese location data
  private static readonly CITIES = [
    'Thành phố Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Nha Trang',
    'Vũng Tàu',
    'Đà Lạt',
    'Bình Dương',
    'Đồng Nai'
  ]

  private static readonly DISTRICTS = {
    'Thành phố Hồ Chí Minh': [
      'Quận 1',
      'Quận 3',
      'Quận 4',
      'Quận 5',
      'Quận 7',
      'Quận 10',
      'Quận Bình Thạnh',
      'Quận Phú Nhuận',
      'Quận Tân Bình',
      'Quận Gò Vấp',
      'Thủ Đức'
    ],
    'Hà Nội': [
      'Ba Đình',
      'Hoàn Kiếm',
      'Hai Bà Trưng',
      'Đống Đa',
      'Cầu Giấy',
      'Thanh Xuân',
      'Tây Hồ',
      'Hà Đông',
      'Nam Từ Liêm'
    ],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ']
    // Add more districts as needed
  }

  private static readonly WARDS: Record<string, string[]> = {
    'Quận 1': ['Bến Nghé', 'Bến Thành', 'Cầu Kho', 'Cầu Ông Lãnh', 'Đa Kao'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 11', 'Phường 12', 'Phường 13'],
    'Cầu Giấy': ['Dịch Vọng', 'Dịch Vọng Hậu', 'Mai Dịch', 'Nghĩa Đô', 'Nghĩa Tân', 'Yên Hòa']
    // Add more wards as needed
  }

  // Property attributes
  private static readonly STREETS = [
    'Nguyễn Huệ',
    'Lê Lợi',
    'Đồng Khởi',
    'Nguyễn Du',
    'Lê Thánh Tôn',
    'Trần Hưng Đạo',
    'Nguyễn Thị Minh Khai',
    'Phan Xích Long',
    'Nguyễn Đình Chiểu',
    'Võ Văn Tần',
    'Điện Biên Phủ',
    'Cách Mạng Tháng 8',
    'Lý Tự Trọng',
    'Huỳnh Thúc Kháng',
    'Tôn Đức Thắng',
    'Hùng Vương',
    'Nguyễn Văn Linh',
    'Hoàng Diệu',
    'Phan Đăng Lưu'
  ]

  private static readonly AMENITIES = [
    'Máy lạnh',
    'Wifi',
    'Máy giặt',
    'Tủ lạnh',
    'Bàn ghế',
    'Bếp điện',
    'Bình nóng lạnh',
    'Ban công',
    'Bảo vệ 24/7',
    'Chỗ để xe',
    'Camera an ninh',
    'Thang máy',
    'Giường',
    'Tủ quần áo',
    'Nhà vệ sinh riêng',
    'Cửa sổ lớn',
    'Quạt trần',
    'Bồn rửa',
    'Bồn tắm',
    'Truyền hình cáp'
  ]

  private static readonly POST_TITLES = [
    'Cho thuê căn hộ {area}m2 tại {district}, {city}',
    'Phòng trọ cao cấp gần {location} - {area}m2',
    'Cho thuê nhà nguyên căn {bedrooms} phòng ngủ tại {street}',
    'Căn hộ chung cư {bedrooms}PN full nội thất tại {district}',
    'Phòng trọ giá rẻ khu vực {district} - {city}',
    'Cho thuê studio apartment {area}m2 tại {location}',
    'Nhà trọ mới xây gần {location}, {district}',
    'CHDV {bedrooms} phòng ngủ đầy đủ nội thất tại {street}',
    'Phòng trọ sinh viên gần {location} giá chỉ {price} triệu/tháng',
    'Căn hộ dịch vụ {area}m2 khu {district}, {city}'
  ]

  /**
   * Creates a fake Post entity
   */
  static async create(customerAccountId?: number, overrides: Partial<Post> = {}): Promise<Partial<Post>> {
    // Get customer if not specified
    let customerId: number | undefined

    if (customerAccountId) {
      // Find customer by account ID
      const customerRepository = new CustomerRepository()
      const customer = await customerRepository.findOne({
        where: { accountId: customerAccountId }
      })

      if (customer) {
        customerId = customer.customerId
      }
    } else {
      // Get random customer
      const customerRepository = AppDataSource.getRepository(Customer)
      const randomCustomer = await customerRepository
        .createQueryBuilder('customer')
        .orderBy('NEWID()') // For SQL Server random selection
        .limit(1)
        .getOne()

      if (randomCustomer) {
        customerId = randomCustomer.customerId
      }
    }

    if (!customerId) {
      throw new Error('No valid customer found for post creation')
    }

    // Generate location data
    const city = faker.helpers.arrayElement(this.CITIES)
    const districtsForCity = (this.DISTRICTS as Record<string, string[]>)[city] || ['District 1']
    const district = faker.helpers.arrayElement(districtsForCity)
    const wardsForDistrict = this.WARDS[district] || ['Ward 1']
    const ward = faker.helpers.arrayElement(wardsForDistrict)
    const street = faker.helpers.arrayElement(this.STREETS)
    const houseNumber = faker.number.int({ min: 1, max: 200 })

    const address = `${houseNumber} ${street}, ${ward}, ${district}, ${city}`

    // Generate property details
    const area = faker.number.int({ min: 20, max: 150 })
    const numBedrooms = faker.number.int({ min: 1, max: 4 })
    const numBathrooms = faker.number.int({ min: 1, max: numBedrooms + 1 })

    // Price ranges vary by city (in VND)
    let priceRange = { min: 2000000, max: 15000000 } // Default range

    if (city === 'Thành phố Hồ Chí Minh' || city === 'Hà Nội') {
      priceRange = { min: 3500000, max: 20000000 }
    } else if (city === 'Đà Nẵng' || city === 'Nha Trang') {
      priceRange = { min: 3000000, max: 15000000 }
    }

    const price = faker.number.int(priceRange)

    // For title, replace placeholders with actual values
    let title = faker.helpers
      .arrayElement(this.POST_TITLES)
      .replace('{area}', area.toString())
      .replace('{district}', district)
      .replace('{city}', city)
      .replace('{street}', street)
      .replace(
        '{location}',
        ['trường đại học', 'chợ', 'trung tâm thương mại', 'công viên', 'bến xe', 'siêu thị', 'bệnh viện'][
          faker.number.int({ min: 0, max: 6 })
        ]
      )
      .replace('{bedrooms}', numBedrooms.toString())
      .replace('{price}', (price / 1000000).toString())

    // Generate 3-5 random amenities
    const amenitiesCount = faker.number.int({ min: 3, max: 5 })
    const selectedAmenities = faker.helpers.arrayElements(this.AMENITIES, amenitiesCount)

    // Generate post description
    const description = [
      `${title}.`,
      `Diện tích: ${area}m2.`,
      `Số phòng ngủ: ${numBedrooms}.`,
      `Số phòng tắm: ${numBathrooms}.`,
      `Địa chỉ: ${address}.`,
      'Tiện ích:',
      ...selectedAmenities.map((a) => `- ${a}`),
      '',
      faker.lorem.paragraph(3),
      '',
      'Liên hệ ngay để xem nhà!'
    ].join('\n')

    // Set a creation date within the last 3 months
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    const creationDate = faker.date.between({ from: threeMonthsAgo, to: now })

    // Set an expiration date 1-3 months in the future
    const expirationDate = new Date(
      now.getFullYear(),
      now.getMonth() + faker.number.int({ min: 1, max: 3 }),
      now.getDate()
    )

    // Generate post data
    const defaultValues: Partial<Post> = {
      ownerId: customerId,
      title: title,
      description: description,
      price: price,      acreage: area,
      city: city,
      district: district,
      ward: ward,
      street: street,
      status: faker.helpers.arrayElement([
        PostStatus.APPROVED,
        PostStatus.PENDING,
        PostStatus.REJECTED,
        PostStatus.HIDDEN,
        PostStatus.SUSPENDED
      ]), // Weighted to have more active posts
      interiorCondition: faker.helpers.arrayElement([InteriorCondition.FULL, InteriorCondition.NONE]),
      createdAt: creationDate,
      extendedAt: expirationDate,
      streetNumber: houseNumber.toString()
    }

    return {
      ...defaultValues,
      ...overrides
    }
  }

  /**
   * Creates multiple fake Post entities
   */
  static async createMany(
    count: number,
    customerAccountId?: number,
    overrides: Partial<Post> = {}
  ): Promise<Partial<Post>[]> {
    const posts: Partial<Post>[] = []
    for (let i = 0; i < count; i++) {
      posts.push(await this.create(customerAccountId, overrides))
    }
    return posts
  }

  /**
   * Seeds posts with their associated multimedia files
   */
  static async seedPosts(count = 50): Promise<void> {
    const postRepository = AppDataSource.getRepository(Post)
    const multimediaFileRepository = AppDataSource.getRepository(MultimediaFile)
    const postMultimediaFileRepository = AppDataSource.getRepository(PostMultimediaFile)

    // Get all customers
    const customerRepository = AppDataSource.getRepository(Customer)
    const customers = await customerRepository.find()

    if (customers.length === 0) {
      throw new Error('No customers found. Please seed customers first.')
    }

    console.log(`Seeding ${count} posts...`)

    for (let i = 0; i < count; i++) {
      // Select a random customer
      const customer = faker.helpers.arrayElement(customers)

      // Create a post for this customer
      const postData = await this.create(customer.accountId)
      const savedPost = await postRepository.save(postData)

      // Create 3-6 images for this post
      const imageCount = faker.number.int({ min: 3, max: 6 })
      for (let j = 0; j < imageCount; j++) {
        // Create a multimedia file
        const isMainImage = j === 0 // First image is the main one

        // Generate realistic image paths for rental properties
        const imageCategories = ['living_room', 'bedroom', 'bathroom', 'kitchen', 'exterior', 'view']
        const category = imageCategories[j % imageCategories.length]
        const imagePath = `uploads/properties/${savedPost.postId}/${category}_${j + 1}.jpg`

        const multimediaFile = {
          filePath: imagePath,
          fileType: 'image/jpeg',
          fileSize: faker.number.int({ min: 500000, max: 2000000 }), // 500KB to 2MB
          uploadedBy: customer.accountId,
          createdAt: postData.createdAt
        }

        const savedFile = await multimediaFileRepository.save(multimediaFile)

        // Link the file to the post
        const postMultimediaFile = {
          postId: savedPost.postId,
          multimediaFileId: savedFile.fileCloudId,
          isMainImage: isMainImage
        }

        await postMultimediaFileRepository.save(postMultimediaFile)
      }

      // Log progress every 10 posts
      if ((i + 1) % 10 === 0 || i === count - 1) {
        console.log(`Created ${i + 1}/${count} posts`)
      }
    }

    console.log(`Seeded ${count} posts with multimedia files`)
  }
}
