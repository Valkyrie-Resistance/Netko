import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('client', {
    description: 'Generate a new axios-based TypeScript client library',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Client name (e.g., foo for client-foo):',
        validate: (input: string) => (input ? true : 'Client name is required'),
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/clients/client-{{dashCase name}}/src/index.ts',
        templateFile: 'templates/client/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/clients/client-{{dashCase name}}/definitions/types.ts',
        templateFile: 'templates/client/types.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/clients/client-{{dashCase name}}/package.json',
        templateFile: 'templates/client/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/clients/client-{{dashCase name}}/tsconfig.json',
        templateFile: 'templates/client/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/clients/client-{{dashCase name}}/README.md',
        templateFile: 'templates/client/README.md.hbs',
      },
    ],
  })
}
