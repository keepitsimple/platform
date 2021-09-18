//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Location as PlatformLocation } from '.'

/**
 * @public
 */
export function locationToUrl (location: PlatformLocation): string {
  let result = '/'
  if (location.path != null) {
    result += location.path.map((p) => encodeURIComponent(p)).join('/')
  }
  if (location.query != null) {
    const queryValue = Object.entries(location.query)
      .map((e) => {
        if (e[1] != null) {
          // Had value
          return encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])
        } else {
          return e[0]
        }
      })
      .join('&')
    if (queryValue.length > 0) {
      result += '?' + queryValue
    }
  }
  if (location.fragment != null && location.fragment.length > 0) {
    result += '#' + location.fragment
  }

  return result
}

/**
 * @public
 */
export function parseLocation (location: Pick<Location, 'pathname' | 'search' | 'hash'>): PlatformLocation {
  return {
    path: parsePath(location.pathname),
    query: parseQuery(location.search),
    fragment: parseHash(location.hash)
  }
}

/**
 * @public
 */
export function parseQuery (query: string): Record<string, string | null> {
  query = query.trim()
  if (query.length === 0 || !query.startsWith('?')) {
    return {}
  }
  query = query.substring(1)
  const vars = query.split('&')
  const result: Record<string, string | null> = {}
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    const key = decodeURIComponent(pair[0])
    if (key.length > 0) {
      if (pair.length > 1) {
        const value = pair[1]
        result[key] = decodeURIComponent(value)
      } else {
        result[key] = null
      }
    }
  }
  return result
}

/**
 * @public
 */
export function parsePath (path: string): string[] {
  const split = path.split('/').map((ps) => decodeURIComponent(ps))
  if (split.length >= 1) {
    if (split[0] === '') {
      split.splice(0, 1)
    }
  }
  if (split.length >= 1) {
    if (split[split.length - 1] === '') {
      split.splice(split.length - 1, 1)
    }
  }
  return split
}

/**
 * @public
 */
export function parseHash (hash: string): string {
  if (hash.startsWith('#')) {
    return hash.substring(1)
  }
  return hash
}
