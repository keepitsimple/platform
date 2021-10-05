import chunter, { Channel, Comment, CommentRef, Message } from '@anticrm/chunter'
import core, { Account, getFullRef, Ref } from '@anticrm/core'
import { component, Component } from '@anticrm/status'
import type { Task } from '@anticrm/task'
import faker from 'faker'
import { accountIds } from './demoAccount'
import { DemoBuilder } from './model'

const demoIds = component('demo-task' as Component, {
  project: {
    DemoChannel: '' as Ref<Channel>
  }
})

/**
 * @public
 */
export async function demoChunter (builder: DemoBuilder, tasks: Task[], dmc = 7, ri = 10): Promise<void> {
  const members: Ref<Account>[] = [core.account.System, ...accountIds]
  await builder.createDoc(
    chunter.class.Channel,
    {
      name: 'PL-CHANNEL',
      description: 'Demo Channel',
      members: members,
      direct: false,
      private: false
    },
    demoIds.project.DemoChannel,
    {
      space: core.space.Model
    }
  )

  // Create few direct message spaces
  for (let i = 0; i < dmc; i++) {
    let ms = faker.random.arrayElements(members, faker.datatype.number(members.length) + 1)
    if (!ms.includes(core.account.System)) {
      ms = [core.account.System, ...ms]
    }
    await builder.createDoc(
      chunter.class.Channel,
      {
        name: 'direct-message',
        description: 'My direct mesage',
        members: ms,
        direct: true,
        private: true
      },
      `dmc-${i}` as Ref<Channel>
    )
  }

  const cii = [2, 0, 4, 7, 20, 30, 1, 2, 3, 1]
  let cind = 0
  for (let i = 0; i < ri; i++) {
    if (i % 500 === 0) {
      console.info('message creation', i, ri)
    }
    const msgId: Ref<Message> = `mid-${i}` as Ref<Message>
    const comments: CommentRef[] = []
    const ci = cii[i % cii.length]
    for (let j = 0; j < ci; j++) {
      const userId = faker.random.arrayElement(accountIds)
      const cid: Ref<Comment> = `cid-${cind++}` as Ref<Comment>
      comments.push({ _id: cid, userId, createOn: Date.now(), lastModified: Date.now() })
      await builder.createDoc(
        chunter.class.Comment,
        {
          replyOf: getFullRef(msgId, chunter.class.Message),
          message: faker.lorem.paragraphs(2)
        },
        cid,
        {
          space: demoIds.project.DemoChannel,
          modifiedOn: Date.now(),
          createOn: Date.now(),
          modifiedBy: userId
        }
      )
    }

    let msgText = faker.lorem.paragraphs(3)

    if (i === ri - 1) {
      // Last message
      msgText = faker.lorem.paragraphs(1)
      msgText += `Hello [${tasks[0].shortRefId as string}](ref://task.Task#${tasks[0]._id})`
      msgText += `\nHello2 [${tasks[1].shortRefId as string}](ref://task.Task#${tasks[1]._id})`
      msgText += faker.lorem.paragraphs(1)
    }

    if (i === ri - 2) {
      // Last message
      msgText = faker.lorem.paragraphs(1)
      msgText += 'Youtube Page [Demo page](https://www.youtube.com/watch?v=LXb3EKWsInQ)'
      msgText += faker.lorem.paragraphs(1)
    }

    if (i === ri - 3) {
      // Last message
      msgText = faker.lorem.paragraphs(1)
      msgText += 'Github link [#261](https://github.com/hardcoreeng/platform/issues/261)'
      msgText += faker.lorem.paragraphs(1)
    }

    await builder.createDoc(
      chunter.class.Message,
      {
        message: msgText,
        comments
      },
      msgId,
      {
        space: demoIds.project.DemoChannel,
        modifiedBy: faker.random.arrayElement(accountIds),
        modifiedOn: Date.now(),
        createOn: Date.now()
      }
    )
  }
}
