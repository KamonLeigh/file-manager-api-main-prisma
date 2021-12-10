import { createModule, gql } from "graphql-modules";
import { prismaClient } from "../prisma";
import { Directory } from "@prisma/client"
import * as directoryService from './service';
import { Pagination } from "../app";

export const directoryModule = createModule({
    id: 'directory-module',
    dirname: __dirname,
    typeDefs: [
        gql`
            type Directory implements FileNode {
                id:          ID!      
                name:        String!
                parentId: ID
                createdAt:   String!
                updatedAt:   String!
                files: [File]!
                directories: [Directory]!
                ancestors: [String]!
            }

            type DirectoryContentsResult {
                id: String!
                name: String!
                mimeType: String!
                size: Int!
                key: String!
                createsAt: String!
                updatedAt: String!
                type: String!

            }

            extend type Query {
                getAllDirectories: [Directory]!
                getDirectory(id: ID): Directory
                getDirectoryContents(id: ID!, pagination: PaginationInput, sort: SortInput): [DirectoryContentsResult]!
            }
            type Mutation {
                createDirectory(name: String!, parentId: String): Directory!
                renameDirectory(id: ID!, name: String!): Directory!
                deleteDirectory(id: ID!): Boolean!
                moveDirectory(id: ID!, parentId: ID):Directory!
            }
        `
    ],
    resolvers: {
        Query : {
            getAllDirectories: () => {
                return prismaClient().directory.findMany()
              },
             getDirectory: async (_: unknown, { id }: { id: Directory['id']}): Promise<Directory | null> => {
                return await directoryService.getDirectory(prismaClient(), id)
             },
             getDirectoryContents: async (_:unknown, { id, pagination, sort}: {id: Directory['id'], pagination?: Pagination, sort?: directoryService.Sort  }):Promise<directoryService.DirectoryContentsResult[]> =>{
                return await directoryService.getDirectoryContents(prismaClient(),id, pagination, sort)
             }

        },
        Mutation: {
            createDirectory: async (_: unknown, { name, parentId}:{ name: Directory['name'], parentId: Directory['parentId'] }) => {
                return await directoryService.createDirectory(prismaClient(), name, parentId)
            },
            renameDirectory: async (_: unknown, { id, name}: { id: Directory['id'], name: Directory['name'] }):Promise<Directory | null > => {
                return await directoryService.renameDirectory(prismaClient(), id, name)
            },
            deleteDirectory: async (_: unknown, { id }: { id: Directory['id']}):Promise<boolean> => {
                return await directoryService.deleteDirectory(prismaClient(), id)
            },
            moveDirectory: async (_: unknown, { id, parentId}: { id: Directory['id'], parentId: Directory['id'] }):Promise<Directory | null > => {
                return await directoryService.moveDirectory(prismaClient(), id, parentId)
            },
           
        }
    }
});