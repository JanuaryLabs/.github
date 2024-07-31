---
title: "Product roadmap API inspired by Posthog roadmap page"
description: "Create user-facing product roadmap API similar to Posthog's through Github issues and labels"
projectName: "Roadmap"
extensions: "postgresql,hono,github"
---

```ts
export default project(
  feature('Roadmap', {
    policies: {
      roadmapIssue: policy.github({
        events: ['issues.labeled', 'issues.unlabeled', 'issues.edited'],
        guard: (event) => event.payload.label?.name.toLowerCase() === 'roadmap',
      }),
      areaLabel: policy.github({
        events: [
          'label.created',
          'issues.labeled',
          'issues.unlabeled',
          'label.edited',
        ],
        guard: (event) =>
          event.payload.label?.name.toLowerCase().startsWith('area:'),
      }),
    },
    workflows: [
      // Posts
      workflow('CreatePostWorkflow', {
        tag: 'posts',
        trigger: trigger.github({
          event: 'issues.labeled',
          policies: ['roadmapIssue'],
          mapper: (trigger) => ({
            issueId: String(trigger.payload.issue.id),
          }),
        }),
        actions: {
          createPost: (trigger) =>
            action.database.upsert({
              table: useTable('posts'),
              conflictFields: [useField('id')],
              columns: [
                useField('id', trigger.mapper.issueId),
                useField('title', '@trigger:issue.title'),
                useField('description', '@trigger:issue.body'),
                useField('issueUrl', trigger.payload.issue.url),
              ],
            }),
        },
      }),
      workflow('AssignPostToAreaWorkflow', {
        tag: 'posts',
        trigger: trigger.github({
          event: 'issues.labeled',
          policies: ['areaLabel'],
          mapper: (trigger) => ({
            areaName: trigger.payload.label?.name
              .toLowerCase()
              .replace('area: ', ''),
          }),
        }),
        actions: {
          getAreaId: (trigger) =>
            action.database.single({
              table: useTable('areas'),
              query: query(
                where('name', 'equals', trigger.mapper.areaName as string),
              ),
              outputName: 'area',
            }),
          createPost: action.database.set({
            table: useTable('posts'),
            query: query(where('id', 'equals', '@trigger:issue.id')),
            columns: [useField('area', '@workflow:area.id')],
          }),
        },
      }),
      workflow('DeletePostWorkflow', {
        tag: 'posts',
        trigger: trigger.github({
          event: 'issues.unlabeled',
          policies: ['roadmapIssue'],
        }),
        actions: {
          unlinkPost: (trigger) =>
            action.database.remove({
              table: useTable('posts'),
              query: query(where('id', 'equals', trigger.payload.issue.id)),
            }),
        },
      }),
      workflow('UnlinkPostFromAreaWorkflow', {
        tag: 'posts',
        trigger: trigger.github({
          event: 'issues.unlabeled',
          policies: ['areaLabel'],
        }),
        actions: {
          unlinkPost: action.database.set({
            table: useTable('posts'),
            query: query(where('id', 'equals', '@trigger:issue.id')),
            columns: [useField('area', null)],
          }),
        },
      }),
      workflow('UpdatePostWorkflow', {
        tag: 'posts',
        trigger: trigger.github({
          event: 'issues.edited',
          policies: ['roadmapIssue'],
        }),
        actions: {
          deletePost: (trigger) =>
            action.database.set({
              table: useTable('posts'),
              query: query(where('id', 'equals', '@trigger:issue.id')),
              columns: [
                useField('title', trigger.payload.issue.title),
                useField('description', trigger.payload.issue.body),
                useField('vote', trigger.payload.issue.reactions['+1']),
              ],
            }),
        },
      }),
      workflow('ListPostsWorkflow', {
        tag: 'posts',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        output: output('return {data:steps.posts}'),
        actions: {
          listPosts: action.database.list({
            outputName: 'posts',
            table: useTable('posts'),
          }),
        },
      }),
      workflow('ListPopularPostsWorkflow', {
        tag: 'posts',
        trigger: trigger.http({
          method: 'get',
          path: '/popular',
        }),
        output: output('return {data:steps.posts}'),
        actions: {
          listPosts: action.database.list({
            outputName: 'posts',
            table: useTable('posts'),
            query: query(sort('vote', 'desc')),
          }),
        },
      }),
      workflow('ListLatestPostsWorkflow', {
        tag: 'posts',
        trigger: trigger.http({
          method: 'get',
          path: '/latest',
        }),
        output: output('return {data:steps.posts}'),
        actions: {
          listPosts: action.database.list({
            outputName: 'posts',
            table: useTable('posts'),
            query: query(sort('createdAt', 'desc')),
          }),
        },
      }),
      workflow('ListUncategorisedPostsWorkflow', {
        tag: 'posts',
        trigger: trigger.http({
          method: 'get',
          path: '/uncategorised',
        }),
        output: output('return {data: steps.posts}'),
        actions: {
          listAreaPosts: trigger => action.database.list({
            outputName: 'posts',
            table: useTable('posts'),
            query: query(
              where('area', 'is', trigger.query.areaId),
              sort('createdAt', 'desc'),
            ),
          }),
        },
      }),
      // Areas
      workflow('CreateAreaWorkflow', {
        tag: 'areas',
        trigger: trigger.github({
          event: 'label.created',
          policies: ['areaLabel'],
          mapper: (trigger) => ({
            areaId: String(trigger.payload.label.id),
            areaName: trigger.payload.label.name
              .toLowerCase()
              .replace('area: ', '')
              .trim(),
          }),
        }),
        actions: {
          createArea: (trigger) =>
            action.database.insert({
              table: useTable('areas'),
              columns: [
                useField('id', trigger.mapper.areaId),
                useField('name', trigger.mapper.areaName),
              ],
            }),
        },
      }),
      workflow('UpsertAreaWorkflow', {
        tag: 'areas',
        trigger: trigger.github({
          event: 'label.edited',
          policies: ['areaLabel'],
          mapper: (trigger) => ({
            areaId: String(trigger.payload.label.id),
            areaName: trigger.payload.label.name
              .toLowerCase()
              .replace('area: ', '')
              .trim(),
          }),
        }),
        actions: {
          createArea: (trigger) =>
            action.database.upsert({
              table: useTable('areas'),
              conflictFields: [useField('id')],
              columns: [
                useField('id', trigger.mapper.areaId),
                useField('name', trigger.mapper.areaName),
              ],
            }),
        },
      }),
      workflow('ListAreasWorkflow', {
        tag: 'areas',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        output: output('return {data:steps.areas}'),
        actions: {
          listAreas: action.database.list({
            outputName: 'areas',
            table: useTable('areas'),
          }),
        },
      }),
      workflow('UnlinkAllAreaRelatedPostsWorkflow', {
        tag: 'areas',
        trigger: trigger.github({
          event: 'label.deleted',
          policies: ['areaLabel'],
        }),
        actions: {
          unlinkPosts: (trigger) =>
            action.database.set({
              table: useTable('posts'),
              query: query(where('area', 'equals', trigger.payload.label.id)),
              columns: [useField('area', null)],
            }),
          removeArea: (trigger) =>
            action.database.remove({
              table: useTable('areas'),
              query: query(where('id', 'equals', trigger.payload.label.id)),
            }),
        },
      }),
    ],
    tables: {
      areas: table({
        fields: {
          id: field.primary({
            type: 'string',
            generated: false,
          }),
          name: field({
            type: 'short-text',
            validations: [mandatory(), unique()],
          }),
        },
      }),
      posts: table({
        fields: {
          id: field.primary({
            type: 'string',
            generated: false,
          }),
          title: field({ type: 'short-text' }),
          vote: field({ type: 'integer' }),
          description: field({ type: 'long-text' }),
          issueUrl: field({ type: 'url' }),
          area: field.relation({
            references: useTable('areas'),
            relationship: 'many-to-one',
          }),
        },
      }),
    },
  }),
);
```
