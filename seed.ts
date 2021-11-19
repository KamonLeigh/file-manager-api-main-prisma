import { PrismaClient } from ".prisma/client";
import { promises as fs } from 'fs';
import { join } from 'path';
import { saveFile} from "./bucket/localBucket"
import { createDirectory } from './directory'
import { createFileRecord } from "./file/service";
import { generateFileName, generateId } from "./util/generators";
import { getMimeTypeFromExtension } from "./util/parsers";

export async function seed(): Promise<void> {
    const seedFilesPath = join(__dirname, '../seed-files-main');
    // const seedFilesPath = `${__dirname}/../seed-files-main`
    const client = new PrismaClient();

    try {
        const existingRootDirectoty = await client.directory.findFirst({
            where: { name: "root"}
        })

        const rootDiretory = existingRootDirectoty ?? (await client.directory.create({data: { name: "root"}}));

        const subDir1 = await createDirectory(client, "Sub-Directory 1", rootDiretory.id);
        const subDir2 = await createDirectory(client, "Sub-Directory 2", rootDiretory.id);

        const subSubDir1 = await createDirectory(client, "Sub-Sub-Directory 1", subDir1.id);
        const subSubDir2 = await createDirectory(client, "Sub-Sub-Directory 2", subDir1.id);


        const filesDir = await fs.readdir(seedFilesPath);
        const files = filesDir.filter(file => file !== ".DS_STORE" && file !== ".git");

        for(const [index, file] of files.entries()) {
            const name = generateFileName();
            const key = await generateId();
            const mimeType = getMimeTypeFromExtension(file);

            const buffer = await fs.readFile(join(seedFilesPath, file));
            const size = buffer.byteLength;

            await saveFile(key, {
                ContentLength: size,
                ContentType: mimeType,
                LastModified: new Date(),
                Body: buffer 
            })

            const directoryId = 
                index < 21 ? subSubDir2.id :
                index < 42 ? subSubDir1.id :
                index < 63 ? subDir2.id :
                index < 84 ? subDir1.id : rootDiretory.id

            await createFileRecord(client, {
                name,
                key,
                directoryId,
                mimeType,
                size
            })

        }
    } catch (error) {
        console.error(error)
    }

    await client.$disconnect();
}

void seed();