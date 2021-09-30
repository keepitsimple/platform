//
// Copyright © 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//
import { S3Storage } from '@anticrm/s3'
import { assignWorkspace, decodeToken, WorkspaceInfo } from '@anticrm/server'
import { Account, generateId, Ref, Space } from '@anticrm/core'
import Koa, { Context } from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'

const storages: Map<string, S3Storage> = new Map<string, S3Storage>()
const workspaces: Map<Ref<Account>, WorkspaceInfo> = new Map<Ref<Account>, WorkspaceInfo>()

/**
 * @public
 */
export interface FileServer {
  shutdown: () => void
}

/**
 * @public
 */
export function createFileServer (
  app: Koa,
  router: Router,
  tokenSecret: string,
  uri: string,
  accessKey: string,
  secret: string
): FileServer {
  router.post('/file', async (ctx: Context) => {
    const token = (ctx.header.token ?? '') as string
    const expires = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    ctx.cookies.set('token', token, { sameSite: 'none', secure: true, httpOnly: true, expires: expires })
    ctx.status = 200
  })

  router.put('/file', async (ctx: Context) => {
    const token = ctx.cookies.get('token')
    if (token === undefined) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const { accountId, workspaceId } = decodeToken(tokenSecret, token)
    const request = ctx.request.body
    const allowed = await checkSecurity(accountId, workspaceId, request.space)
    if (!allowed) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const storage = await getStorage(workspaceId, uri, accessKey, secret)
    const link = await storage.getUploadLink(request.space + request.key, request.type)
    ctx.status = 200
    ctx.set('Content-Type', 'text/plain')
    ctx.set('Content-Encoding', 'identity')
    ctx.body = link
  })

  router.delete('/file', async (ctx: Context) => {
    const token = ctx.cookies.get('token')
    if (token === undefined) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const { accountId, workspaceId } = decodeToken(tokenSecret, token)
    const request = ctx.request.body
    const allowed = await checkSecurity(accountId, workspaceId, request.space)
    if (!allowed) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const storage = await getStorage(workspaceId, uri, accessKey, secret)
    await storage.remove(request.space + request.key)
    ctx.status = 200
  })

  router.get('/file/:spaceId/:key/:fileName', async (ctx: Context) => {
    const space = ctx.params.spaceId
    const key = ctx.params.key
    const fileName = ctx.params.fileName
    const token = ctx.cookies.get('token')
    if (token === undefined) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const { accountId, workspaceId } = decodeToken(tokenSecret, token)
    const allowed = await checkSecurity(accountId, workspaceId, space)
    if (!allowed) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    const storage = await getStorage(workspaceId, uri, accessKey, secret)
    const link = await storage.getDownloadLink(space + key, fileName)
    ctx.redirect(link)
  })

  app.use(bodyParser())

  return {
    shutdown: () => {}
  }
}

async function checkSecurity (accountId: Ref<Account>, workspaceId: string, space: Ref<Space>): Promise<boolean> {
  let currentWorkspace = workspaces.get(accountId)
  if (currentWorkspace === undefined) {
    const clientId = generateId()
    const { workspace } = await assignWorkspace({ clientId, accountId, workspaceId, tx: () => {} })
    workspaces.set(accountId, workspace)
    currentWorkspace = workspace
  }
  const allowed = currentWorkspace.security.getUserSpaces(accountId)
  return allowed.has(space)
}

async function getStorage (workspaceId: string, uri: string, accessKey: string, secret: string): Promise<S3Storage> {
  let storage = storages.get(workspaceId)
  if (storage === undefined) {
    storage = await S3Storage.create(accessKey, secret, uri, workspaceId)
    storages.set(workspaceId, storage)
  }
  return storage
}
