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

import { plugin } from '@anticrm/platform'
import type { Asset } from '@anticrm/status'
import type { Plugin, Service } from '@anticrm/platform'
import type { Space } from '@anticrm/core'

export interface Channel extends Space {}

export interface ChunterService extends Service {}

const PluginChunter = 'chunter' as Plugin<ChunterService>

export default plugin(PluginChunter, {}, {
  icon: {
    Chunter: '' as Asset,
    Hashtag: '' as Asset
  }
})
