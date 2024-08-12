export default project(
  feature('Tasks', {
    workflows: [
      workflow('CreateTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'post',
          path: '/tasks',
        }),
        output: output('return { task: steps.task }'),
        actions: {
          insertTask: action.database.insert({
            outputName: 'task',
            table: useTable('tasks'),
            columns: [useField('name', '@trigger:body.name')],
          }),
        },
      }),
      workflow('UpdateTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'put',
          path: '/tasks/:id',
        }),
        output: output('return { task: steps.task }'),
        actions: {
          update: action.database.set({
            outputName: 'task',
            table: useTable('tasks'),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('description', '@trigger:body.description'),
              useField('status', '@trigger:body.status'),
              useField('dueDate', '@trigger:body.dueDate'),
              useField('favourite', '@trigger:body.favourite'),
            ],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('RemoveTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'delete',
          path: '/tasks/:id',
        }),
        actions: {
          remove: action.database.remove({
            table: useTable('tasks'),
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('CompleteTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'post',
          path: '/tasks/:id/complete',
        }),
        actions: {
          complete: action.database.set({
            table: useTable('tasks'),
            columns: [useField('status', 'completed')],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('UncompleteTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'post',
          path: '/tasks/:id/uncomplete',
        }),
        actions: {
          uncomplete: action.database.set({
            table: useTable('tasks'),
            columns: [useField('status', 'todo')],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('MoveTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'post',
          path: '/tasks/:id/move',
        }),
        actions: {
          move: action.database.set({
            table: useTable('tasks'),
            columns: [useField('list', '@trigger:body.listId')],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('StarTaskWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'post',
          path: '/tasks/:id/star',
        }),
        actions: {
          star: action.database.set({
            table: useTable('tasks'),
            columns: [useField('favourite', true)],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('CreateListWorkflow', {
        tag: 'lists',
        trigger: trigger.http({
          method: 'post',
          path: '/',
        }),
        output: output('return { list: steps.list }'),
        actions: {
          insertList: action.database.insert({
            outputName: 'list',
            table: useTable('lists'),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('innerList', '@trigger:body.innerList'),
            ],
          }),
        },
      }),
      workflow('UpdateListWorkflow', {
        tag: 'lists',
        trigger: trigger.http({
          method: 'put',
          path: '/:id',
        }),
        actions: {
          update: action.database.set({
            table: useTable('lists'),
            columns: [useField('name', '@trigger:body.name')],
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('DeleteCompletedTasksWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'delete',
          path: '/completed',
        }),
        actions: {
          deleteCompletedTask: action.database.remove({
            table: useTable('tasks'),
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('DeleteListWorkflow', {
        tag: 'lists',
        trigger: trigger.http({
          method: 'delete',
          path: '/:id',
        }),
        actions: {
          deleteList: action.database.remove({
            table: useTable('lists'),
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
          }),
        },
      }),
      workflow('ListListsWorkflow', {
        tag: 'lists',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        actions: {
          list: action.database.list({
            outputName: 'lists',
            table: useTable('lists'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(),
          }),
        },
      }),
      workflow('ListTasksWorkflow', {
        tag: 'tasks',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        actions: {
          list: action.database.list({
            outputName: 'tasks',
            table: useTable('tasks'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(
              sort('name', 'asc'),
            ),
          }),
        },
      }),
    ],
    tables: {
      tasks: table({
        fields: {
          name: field({ type: 'short-text' }),
          description: field({ type: 'long-text' }),
          list: field.relation({
            references: useTable('lists'),
            relationship: 'many-to-one',
            validations: [mandatory()],
          }),
          subList: field.relation({
            references: useTable('lists'),
            relationship: 'many-to-one',
          }),
          status: field({
            type: 'single-select',
            metadata: {
              style: 'enum',
              values: ['todo', 'completed'],
              defaultValue: 'todo',
            },
          }),
          dueDate: field({ type: 'datetime' }),
          favourite: field({ type: 'boolean' }),
        },
      }),
      lists: table({
        fields: {
          name: field({ type: 'short-text' }),
          innerList: field({ type: 'boolean' }),
        },
      }),
    },
  }),
);
