//
// Copyright © 2020 Anticrm Platform Contributors.
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

import { addLocation } from '@anticrm/platform'

import login from '@anticrm/login'
import workbench from '@anticrm/workbench'
import core from '@anticrm/plugin-core'
import chunter from '@anticrm/chunter'
import calendar from '@anticrm/calendar'
import task from '@anticrm/task'
import meeting from '@anticrm/meeting'
import recruiting from '@anticrm/recruiting'
import fsm from '@anticrm/fsm'
import attachment from '@anticrm/attachment'

import '@anticrm/ui-assets'
import '@anticrm/chunter-assets'
import '@anticrm/task-assets'
import '@anticrm/login-assets'
import '@anticrm/meeting-assets'
import '@anticrm/recruiting-assets'
import '@anticrm/workbench-assets'
import '@anticrm/calendar-assets'
import '@anticrm/attachment-assets'

export function configurePlatform (): void {
  if (process.env.CLIENT !== 'server') {
    console.info('use in memory DB')
    addLocation(core, async () => await import(/* webpackChunkName: "plugin-core-dev" */ '@anticrm/plugin-core-dev'))
  } else {
    console.info('use server DB')
    addLocation(core, async () => await import(/* webpackChunkName: "plugin-core" */ '@anticrm/plugin-core-impl'))
  }

  addLocation(login, async () => await import(/* webpackChunkName: "login" */ '@anticrm/login-impl'))
  addLocation(workbench, async () => await import(/* webpackChunkName: "workbench" */ '@anticrm/workbench-impl'))
  addLocation(chunter, async () => await import(/* webpackChunkName: "chunter" */ '@anticrm/chunter-impl'))
  addLocation(task, async () => await import(/* webpackChunkName: "task" */ '@anticrm/task-impl'))
  addLocation(fsm, async () => await import(/* webpackChunkName: "fsm" */ '@anticrm/fsm-impl'))
  addLocation(meeting, async () => await import(/* webpackChunkName: "meeting" */ '@anticrm/meeting-impl'))
  addLocation(recruiting, async () => await import(/* webpackChunkName: "recruiting" */ '@anticrm/recruiting-impl'))
  addLocation(calendar, async () => await import(/* webpackChunkName: "calendar" */ '@anticrm/calendar-impl'))
  addLocation(attachment, async () => await import(/* webpackChunkName: "attachment" */ '@anticrm/attachment-impl'))
}
