import { Directory, PrismaClient } from '@prisma/client';
import { deleteFile } from '../file';

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
 
export async function getDirectory(client: PrismaClient, id: Directory["id"]): Promise<Directory | null> {
    return await client.directory.findUnique({ where: { id }, include: { files: true, directories: true}})
}

export async function renameDirectory(client: PrismaClient, id: Directory["id"], name: Directory["name"]): Promise<Directory> {
    if (name.toLowerCase() === 'root') {
        throw new Error("Directory 'root' is reserved")
    }

    const directory = await client.directory.findUnique({ where: { id }});

    if (directory?.name  === "root") {
        throw new Error("Root directory may not be renamed")
    }
    return await client.directory.update({ where: { id }, data: { name }, include: { files: true, directories: true } })
}

export async function deleteDirectory(
    client: PrismaClient,
    id: Directory["id"]
  ): Promise<boolean> {
    const files = await client.file.findMany({
      where: { directoryId: id },
    })
    for (const file of files) {
      await deleteFile(client, file.id)
    }
    await client.directory.delete({ where: { id } })
    return true
  }

  export async function findDirectories(client: PrismaClient, query: string):Promise<Directory[]> {
      return await client.directory.findMany({
          where: {
              name: {
                  contains: query,
                  mode: "insensitive"
              }
          },
          orderBy: [{ name: "asc"}]
      })

  }