export default project(
  feature('menu', {
    workflows: [
      workflow('ListMenusWorkflow', {
        tag: 'menus',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        output: output('return { menus: steps.menus }'),
        actions: {
          fetchMenus: action.database.list({
            outputName: 'menus',
            table: useTable('menus'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(),
          }),
        },
      }),
      workflow('CreateMenuWorkflow', {
        tag: 'menus',
        trigger: trigger.http({
          method: 'post',
          path: '/',
        }),
        actions: {
          insertMenu: action.database.insert({
            outputName: 'menu',
            table: useTable('menus'),
            columns: [useField('name', '@trigger:body.name')],
          }),
        },
      }),
      workflow('CreateProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/',
        }),
        actions: {
          insertProduct: action.database.insert({
            outputName: 'product',
            table: useTable('products'),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('price', '@trigger:body.priceId'),
              useField('discount', '@trigger:body.discount'),
              useField('calories', '@trigger:body.calories'),
              useField('description', '@trigger:body.description'),
              useField('image', '@trigger:body.image'),
              useField('category', '@trigger:body.categoryId'),
            ],
          }),
        },
      }),
      workflow('ListProductsWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        output: output('return { products: steps.products }'),
        actions: {
          fetchProducts: action.database.list({
            outputName: 'products',
            table: useTable('products'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(),
          }),
        },
      }),
      workflow('CreateCategoryWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/category',
        }),
        actions: {
          insertCategory: action.database.insert({
            outputName: 'category',
            table: useTable('categories'),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('menu', '@trigger:body.menuId'),
            ],
          }),
        },
      }),
      workflow('ListCategoriesWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/category',
        }),
        output: output('return { menus: steps.categories }'),
        actions: {
          fetchCategories: action.database.list({
            outputName: 'categories',
            table: useTable('categories'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(),
          }),
        },
      }),
      workflow('CreateProductTagWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/tag',
        }),
        actions: {
          insertProductTag: action.database.insert({
            outputName: 'tag',
            table: useTable('productTags'),
            columns: [useField('name', '@trigger:body.name')],
          }),
        },
      }),
      workflow('ListProductTagsWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/tag',
        }),
        output: output('return { tags: steps.tags }'),
        actions: {
          fetchProductTags: action.database.list({
            outputName: 'tags',
            table: useTable('productTags'),
            limit: 50,
            pagination: 'deferred_joins',
            query: query(),
          }),
        },
      }),
      workflow('CreateProductOptionWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/option',
        }),
        actions: {
          insertProductOption: action.database.insert({
            outputName: 'option',
            table: useTable('productOptions'),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('price', '@trigger:body.priceId'),
            ],
          }),
        },
      }),
      workflow('UpdateProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:id',
        }),
        actions: {
          product: action.database.set({
            table: useTable('products'),
            query: query(
              where('id', 'equals', '@trigger:path.id')
            ),
            columns: [
              useField('name', '@trigger:body.name'),
              useField('price', '@trigger:body.priceId'),
              useField('discount', '@trigger:body.discount'),
              useField('calories', '@trigger:body.calories'),
              useField('description', '@trigger:body.description'),
              useField('image', '@trigger:body.image'),
              useField('category', '@trigger:body.category'),
            ],
          }),
        },
      }),
      workflow('AssignTagToProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:productId/tag',
        }),
        actions: {
          productTagLink: action.database.insert({
            table: useTable('productTagLink'),
            columns: [
              useField('product', '@trigger:path.productId'),
              useField('tag', '@trigger:body.tagId'),
            ],
          }),
        },
      }),
      workflow('AssignOptionToProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:productId/option',
        }),
        actions: {
          productOptionLink: action.database.insert({
            table: useTable('productOptionLink'),
            columns: [
              useField('product', '@trigger:path.productId'),
              useField('option', '@trigger:body.optionId'),
            ],
          }),
        },
      }),
      workflow('CreateOrderWorkflow', {
        tag: 'orders',
        trigger: trigger.http({
          method: 'post',
          path: '/order',
        }),
        actions: {
          insertOrder: action.database.insert({
            outputName: 'order',
            table: useTable('order'),
            columns: [],
          }),
          details: action.database.insert({
            outputName: 'details',
            table: useTable('orderDetails'),
            columns: [
              useField('total', '@trigger:body.total'),
              useField('subtotal', '@trigger:body.subtotal'),
              useField('tax', '@trigger:body.tax'),
              // useField('order', '@workflow:order.id'),
            ],
          }),
        },
      }),
    ],
    tables: {
      offers: table({
        fields: {
          title: field({
            type: 'short-text',
            validations: [mandatory()],
          }),
          subtitle: field({ type: 'short-text' }),
          image: field({ type: 'url' }),
        },
      }),
      menus: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
        },
      }),
      categories: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          menu: field.relation({
            references: useTable('menus'),
            relationship: 'many-to-one',
          }),
        },
      }),
      products: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          discount: field.integer(),
          calories: field.integer(),
          description: field({ type: 'long-text' }),
          image: field({ type: 'url' }),
          category: field.relation({
            references: useTable('categories'),
            relationship: 'many-to-one',
          }),
        },
      }),
      pricing: table({
        fields: {
          price: field({ type: 'price' }),
        },
      }),
      productTags: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
        },
      }),
      productOptions: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
        },
      }),
      productTagLink: table({
        fields: {
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          tag: field.relation({
            references: useTable('productTags'),
            relationship: 'many-to-one',
          }),
        },
      }),
      productOptionLink: table({
        fields: {
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          option: field.relation({
            references: useTable('productOptions'),
            relationship: 'many-to-one',
          }),
        },
      }),
    },
  }),
  feature('orders', {
    tables: {
      orderItemOption: table({
        fields: {
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          option: field.relation({
            references: useTable('productOptions'),
            relationship: 'many-to-one',
          }),
        },
      }),
      orderItem: table({
        fields: {
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          quantity: field.integer(),
          options: field.relation({
            references: useTable('orderItemOption'),
            relationship: 'many-to-many',
          }),
        },
      }),
      orderDetails: table({
        fields: {
          total: field({ type: 'price' }),
          subtotal: field({ type: 'price' }),
          tax: field({ type: 'percentage' }),
          order: field.relation({
            references: useTable('order'),
            relationship: 'one-to-one',
          }),
        },
      }),
      order: table({
        fields: {},
      }),
      orderToOrderItemLink: table({
        fields: {
          order: field.relation({
            references: useTable('order'),
            relationship: 'many-to-one',
          }),
          item: field.relation({
            references: useTable('orderItem'),
            relationship: 'many-to-one',
          }),
        },
      }),
    },
    workflows: [],
  }),
);
