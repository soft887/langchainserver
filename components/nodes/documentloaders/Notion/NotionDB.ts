import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { NotionAPILoader, NotionAPILoaderOptions } from 'langchain/document_loaders/web/notionapi'

class NotionDB_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Notion Database'
        this.name = 'notionDB'
        this.type = 'Document'
        this.icon = 'notion.png'
        this.category = 'Document Loaders'
        this.description = 'Load data from Notion Database (each row is a separate document with all properties as metadata)'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Notion Integration Token',
                name: 'notionIntegrationToken',
                type: 'password',
                description:
                    'You can find integration token <a target="_blank" href="https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration">here</a>'
            },
            {
                label: 'Notion Database Id',
                name: 'databaseId',
                type: 'string',
                description: 'If your URL looks like - https://www.notion.so/abcdefh?v=long_hash_2, then abcdefh is the database ID'
            },
            {
                label: 'Metadata',
                name: 'metadata',
                type: 'json',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const databaseId = nodeData.inputs?.databaseId as string
        const metadata = nodeData.inputs?.metadata
        const notionIntegrationToken = nodeData.inputs?.notionIntegrationToken as string

        const obj: NotionAPILoaderOptions = {
            clientOptions: {
                auth: notionIntegrationToken
            },
            id: databaseId,
            type: 'database'
        }
        const loader = new NotionAPILoader(obj)

        let docs = []
        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of docs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
                finaldocs.push(newdoc)
            }
            return finaldocs
        }

        return docs
    }
}

module.exports = { nodeClass: NotionDB_DocumentLoaders }
