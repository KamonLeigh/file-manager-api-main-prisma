import { FileVersion } from ".prisma/client";
import { Pagination } from "../app";
import { createModule, gql } from "graphql-modules";
import { prismaClient } from "../prisma";
import * as fileVerionService from "./service";


export const fileVersionModule = createModule({
    id: 'fileVersion-module',
    dirname: __dirname,
    typeDefs: [
        gql`
            type FileVersion implements FileNode {
                id:       ID!   
                mimeType:  String!
                name: String!
                size:     Int!
                key: String!
                fileId:   ID!
                createdAt:  String!
                updatedAt:   String!
                deletedAt: String 
            }

            input CreateFileVersionInput {
                fileId: ID!
                name: String!
                mimeType: String!
                size: Int!
            }

            type CreateFileVersionResult {
                id: ID!
                name: String!
                mimeType:  String!
                size:     Int!
                key: String!
                fileId:   ID!
                createdAt:  String!
                updatedAt:   String!
                url: String!
            }

            extend type Query {
                getAllFileVersions: [FileVersion]!
                requestFileDownload(key: String!): String!
                getFileVersion(id: ID!): FileVersion
                getFileVersions(fileId: ID! pagination: PaginationInput): [FileVersion]!
            }

            extend type Mutation {
                createFileVersionRecord(input: CreateFileVersionInput!):CreateFileVersionResult!
                renameFileVerion(id: ID! name: String!): FileVersion
                deleteFileVerdion(id: ID):Boolean!
            }
        `
    ],
    resolvers: {
        Query : {
            getAllFileVersions: () => {
                return prismaClient().fileVersion.findMany()
              },
              getFileVersion:async (_: unknown, { id }: { id: string}) => {
                return await fileVerionService.getFileVersion(prismaClient(), id);
              },
              getFileVersions: async (_:unknown, { fileId, pagination }: { fileId : string, pagination?: Pagination  }) => {
                  return await fileVerionService.getFileVersions(prismaClient(), fileId, pagination)
              },
            requestFileDownload: async(_: unknown, { key }: { key: string}) => {
                return await fileVerionService.requestFileDownload(key)
            },
        },
        Mutation: {
            createFileVersionRecord: async(_:unknown, { input } : { input : fileVerionService.CreateFileVersionInput}):Promise<FileVersion & { url: string }>=> {
                return await fileVerionService.createFileVersionRecord(prismaClient(), input)
            },
            renameFileVerion: async(_:unknown, { id, name}: { id: FileVersion["id"], name: FileVersion["name"]}):Promise<FileVersion> => {
                return await fileVerionService.renameFileVerion(prismaClient(), id, name )
            },
            deleteFileVerdion: async(_:unknown, { id }: { id: FileVersion["id"]}) => {
                return await fileVerionService.deleteFileVerdion(prismaClient(), id)
            }

           
        }
    }
});

