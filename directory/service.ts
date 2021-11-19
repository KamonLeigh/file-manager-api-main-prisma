import { Directory, PrismaClient } from '@prisma/client';

export async function createDirectory(client: PrismaClient, name: Directory["name"], parentId: Directory["parentId"]): Promise<Directory> {
    console.log(name, parentId)
    
    if (name === "root") {
        throw new Error("Directory name 'root' is reserved")
    }
    const directory = await client.directory.create({
        data: {
            name,
            parentId
        }
    })

    console.log(directory)

    return directory
}