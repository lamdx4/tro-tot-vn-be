import '../src/preload-env';
import AppDataSource from '../src/infras/db/datasource';
import { MultimediaFile } from '../src/domains/entities/multimedia-file.entity';
import CloudDriveService from '../src/services/google-drive.service';

async function checkFile() {
  try {
    console.log('🔄 Connecting to Database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to SQL Server!');

    const fileRepo = AppDataSource.getRepository(MultimediaFile);
    const driveService = CloudDriveService.gI();

    const idsToCheck = [2965, 17814];

    for (const fileId of idsToCheck) {
      console.log(`\n--------------------------------------------`);
      console.log(`🔍 Checking DB for File ID: ${fileId}...`);
      
      const dbRecord = await fileRepo.findOneBy({ fileId });
      
      if (!dbRecord) {
        console.log(`❌ FILE ID ${fileId} DOES NOT EXIST in Database!`);
        continue;
      }

      console.log(`✅ FOUND record in Database!`);
      console.log(`  - File ID: ${dbRecord.fileId}`);
      console.log(`  - Cloud ID: "${dbRecord.fileCloudId}"`);
      console.log(`  - File Type: ${dbRecord.fileType}`);
      console.log(`  - Created At: ${dbRecord.createdAt}`);

      console.log(`\n🔄 Attempting to connect to Google Drive for Cloud ID: "${dbRecord.fileCloudId}"...`);
      try {
        const streamResult = await driveService.downloadFileToStream(dbRecord.fileCloudId);
        if (streamResult) {
          console.log(`🟢 SUCCESS: File found and streamable from Google Drive!`);
          console.log(`  - MimeType/Metadata: ${streamResult.metaData}`);
        } else {
          console.log(`🔴 FAILURE: Google Drive returned null for this Cloud ID!`);
        }
      } catch (err: any) {
        console.error(`❌ EXCEPTION while calling Google Drive API:`, err);
      }
    }
    console.log(`--------------------------------------------\n`);

  } catch (error) {
    console.error('❌ Error executing checkFile:', error);
  } finally {
    process.exit(0);
  }
}

checkFile();
