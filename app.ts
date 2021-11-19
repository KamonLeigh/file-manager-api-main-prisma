// eslint-disable-next-line
require("dotenv").config()
import { FileVersion, Directory, File } from "@prisma/client";
import express, { Request} from "express";
import { graphqlHTTP } from 'express-graphql';
import { createApplication, createModule, gql} from 'graphql-modules';
import { directoryModule } from "./directory";
import { downloadLocalFile, uploadLocalFile } from "./bucket";
import { fileModule } from "./file";
import { fileVersionModule } from "./fileVersion";

export interface Pagination {
  pageLength: number
  page: number 
}

const mainModule = createModule({
  id: 'main-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      interface FileNode {
      id: ID!
      name: String!
      createdAt: String!
      updatedAt: String!
  }


  input PaginationInput {
    pageLength: Int!
    page: Int!
  }
  
  type Query {
    searchFiles(query: String!):[FileNode]
  }
    `
  ],
  resolvers: {
    FileNode: {
      __resolveType(obj: File | FileVersion | Directory) {
        if (Object.prototype.hasOwnProperty.call(obj, 'parentId')){
          return 'Directory';
        }

        if (Object.prototype.hasOwnProperty.call(obj, 'fileId')){
          return 'FileVersion';
        }

        if (Object.prototype.hasOwnProperty.call(obj, 'directoryId')){
          return 'File';
        }
      }
    },
    Query: {
      searchFiles: () => { return []}
    }
  }
})

const api = createApplication({ modules: [mainModule, fileModule, fileVersionModule, directoryModule]})

const app = express()

app.get("/file", function(req, res){
  void downloadLocalFile(`${req.protocol}://${req.get("host") ?? ""}${req.originalUrl}`)
  .then((file) => {
    res.setHeader("Content-Type", file.ContentType)
    res.status(200).send(file.Body)
  }).catch(err => {
    res.status(400).send(err)
  })
})                

app.use(/\/((?!graphql).)*/, express.raw({limit: "100000kb", type:"*/*"}))

app.put("/file", function(req:Request<unknown, unknown, Buffer>, res){
  const { headers } = req;

  const data = {
    ContentType: headers["content-type"] ?? "application/octet-stream",
    Body: req.body
  }

  void uploadLocalFile(`${req.protocol}://${req.get("host") ?? ""}${req.originalUrl}`, data)
  .then(() => res.status(200).send(true))
  .catch(error => res.status(400).send(error))
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use("/graphql", graphqlHTTP({
  schema: api.schema,
  customExecuteFn: api.createExecution(),
  graphiql: process.env.NODE_ENV === 'development'
}))






app.listen(process.env.LOCAL_PORT ?? 4000, () => {
  console.log(`Application running on port ${process.env.LOCAL_PORT ?? 4000}.`)
})
